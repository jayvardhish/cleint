import os
from dotenv import load_dotenv
from openai import OpenAI

# Ensure environment is loaded from the correct path
env_path = os.path.join(os.path.dirname(__file__), '.env')
load_dotenv(env_path)


class SmartAIClient:
    """
    OpenAI-compatible client wrapper with automatic fallback.
    Priority order: Groq (primary) -> DeepSeek (fallback)
    OpenAI is excluded — had quota/billing issues.
    """

    def __init__(self, clients):
        self.clients = clients  # List of dicts: {'name', 'client', 'model', 'max_tokens'}
        self.active_index = 0
        self._sync_active_attributes()
        self.is_fallback = False

    def _sync_active_attributes(self):
        """Sync convenience attributes to the currently active provider."""
        if not self.clients:
            return
        current = self.clients[self.active_index]
        self.default_max_tokens = current.get("max_tokens", 4000)
        self.is_openrouter = current.get("is_openrouter", False)
        self.model_name = current.get("model", "llama-3.3-70b-versatile")

    def reset(self):
        """Reset to Groq (primary provider)."""
        print("🔄 AI Engine: Resetting to Groq primary provider...")
        self.active_index = 0
        self.is_fallback = False
        self._sync_active_attributes()
        return True

    @property
    def chat(self):
        return self

    @property
    def completions(self):
        return self

    def create(self, *args, **kwargs):
        """
        Execute a chat completion, always using the current provider's model.
        Automatically falls back on quota/auth errors.
        """
        while self.active_index < len(self.clients):
            current = self.clients[self.active_index]
            client_obj = current['client']
            provider_name = current['name']

            # ALWAYS force the current provider's correct model name
            kwargs["model"] = current['model']

            try:
                self._sync_active_attributes()
                print(f"📡 [{provider_name}] Calling model: {current['model']}")
                return client_obj.chat.completions.create(*args, **kwargs)

            except Exception as e:
                err_str = str(e).lower()

                # Detect quota/auth failures that should trigger a fallback
                is_quota_error = any(keyword in err_str for keyword in [
                    "401", "402", "403",
                    "authentication", "unauthorized",
                    "balance", "insufficient_quota",
                    "rate_limit", "rate limit",
                    "exceeded", "quota",
                    "billing", "payment"
                ])

                if is_quota_error and self.active_index < len(self.clients) - 1:
                    next_name = self.clients[self.active_index + 1]['name']
                    print(f"⚠️  {provider_name} failed [{type(e).__name__}]. Falling back to {next_name}...")
                    self.active_index += 1
                    self.is_fallback = True
                    self._sync_active_attributes()
                    continue

                # Non-quota error or no more fallbacks — raise it
                print(f"❌ [{provider_name}] Error: {e}")
                raise e

        raise Exception(
            "All AI providers exhausted. "
            "Please check your GROQ_API_KEY in backend/.env"
        )


def get_ai_client():
    """Build and return a SmartAIClient with all configured providers."""
    providers = []

    # ── 1. GROQ (Primary — fast, free tier, OpenAI-compatible) ──────────────
    groq_key = os.getenv("GROQ_API_KEY", "").strip()
    if groq_key:
        try:
            groq_url = os.getenv("GROQ_API_URL", "https://api.groq.com/openai/v1")
            providers.append({
                'name': 'Groq',
                'client': OpenAI(api_key=groq_key, base_url=groq_url),
                'model': "llama-3.3-70b-versatile",
                'max_tokens': 4000
            })
            print("✅ Groq provider ready  → llama-3.3-70b-versatile")
        except Exception as e:
            print(f"❌ Groq init failed: {e}")

    # ── 2. DEEPSEEK (Fallback) ───────────────────────────────────────────────
    ds_key = os.getenv("DEEPSEEK_API_KEY", "").strip()
    if ds_key:
        try:
            is_openrouter = ds_key.startswith("sk-or-")
            ds_url = os.getenv(
                "DEEPSEEK_API_URL",
                "https://openrouter.ai/api/v1" if is_openrouter else "https://api.deepseek.com/v1"
            )
            providers.append({
                'name': 'DeepSeek',
                'client': OpenAI(api_key=ds_key, base_url=ds_url),
                'model': "deepseek/deepseek-chat" if is_openrouter else "deepseek-chat",
                'max_tokens': 4000,
                'is_openrouter': is_openrouter
            })
            print("✅ DeepSeek provider ready → deepseek-chat (fallback)")
        except Exception as e:
            print(f"❌ DeepSeek init failed: {e}")

    # NOTE: OpenAI excluded intentionally — quota/billing issues.

    if not providers:
        print("❌ CRITICAL: No AI providers configured!")
        print("   → Add GROQ_API_KEY to backend/.env")
        return None

    chain = " -> ".join(p['name'] for p in providers)
    print(f"📡 AI ENGINE READY  |  Chain: {chain}")
    return SmartAIClient(providers)


# ── Global singleton client — initialized once at server startup ─────────────
client = get_ai_client()
