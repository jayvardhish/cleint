import tiktoken
from typing import List, Tuple
import os
from openai import OpenAI

def count_tokens(text: str, model: str = "gpt-3.5-turbo") -> int:
    """Count the number of tokens in a text string."""
    try:
        encoding = tiktoken.encoding_for_model(model)
    except KeyError:
        encoding = tiktoken.get_encoding("cl100k_base")
    return len(encoding.encode(text))

def chunk_text(text: str, max_tokens: int = 1000, overlap: int = 100) -> List[dict]:
    """
    Split text into chunks of approximately max_tokens with overlap.
    Returns list of dicts with 'text', 'start_idx', 'end_idx', 'token_count'.
    """
    try:
        encoding = tiktoken.get_encoding("cl100k_base")
    except:
        # Fallback: simple character-based chunking
        return chunk_text_simple(text, max_tokens * 4, overlap * 4)
    
    tokens = encoding.encode(text)
    chunks = []
    
    # Ensure overlap is less than chunk size to prevent infinite loops
    overlap = min(overlap, max_tokens - 1)
    start = 0
    chunk_id = 0
    
    while start < len(tokens):
        # Get chunk of tokens
        end = min(start + max_tokens, len(tokens))
        chunk_tokens = tokens[start:end]
        
        # Decode back to text
        chunk_text = encoding.decode(chunk_tokens)
        
        chunks.append({
            'id': chunk_id,
            'text': chunk_text,
            'start_token': start,
            'end_token': end,
            'token_count': len(chunk_tokens)
        })
        
        chunk_id += 1
        
        # Move start forward, accounting for overlap
        start = end - overlap
        
        # Prevent infinite loop
        if start >= len(tokens):
            break
    
    return chunks

def chunk_text_simple(text: str, max_chars: int = 4000, overlap: int = 400) -> List[dict]:
    """Fallback simple character-based chunking."""
    chunks = []
    start = 0
    chunk_id = 0
    
    while start < len(text):
        end = min(start + max_chars, len(text))
        chunk_text = text[start:end]
        
        chunks.append({
            'id': chunk_id,
            'text': chunk_text,
            'start_char': start,
            'end_char': end,
            'char_count': len(chunk_text)
        })
        
        chunk_id += 1
        start = end - overlap
        
        if start >= len(text):
            break
    
    return chunks

def generate_embeddings(texts: List[str], use_openai: bool = True) -> List[List[float]]:
    """
    Generate embeddings for a list of texts.
    
    Args:
        texts: List of text strings to embed
        use_openai: If True, use OpenAI embeddings. If False, use sentence-transformers.
    
    Returns:
        List of embedding vectors
    """
    if use_openai:
        return generate_openai_embeddings(texts)
    else:
        return generate_local_embeddings(texts)

def generate_openai_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using OpenAI's text-embedding-3-small model."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY not set. Cannot generate embeddings.")
    
    client = OpenAI(api_key=api_key)
    
    # OpenAI allows batch embedding
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=texts
    )
    
    return [item.embedding for item in response.data]

def generate_local_embeddings(texts: List[str]) -> List[List[float]]:
    """Generate embeddings using sentence-transformers (local, free)."""
    from sentence_transformers import SentenceTransformer
    
    # Use a lightweight model
    model = SentenceTransformer('all-MiniLM-L6-v2')
    embeddings = model.encode(texts, convert_to_numpy=True)
    
    return embeddings.tolist()
