import easyocr
import threading

_reader = None
_lock = threading.Lock()

def get_reader(langs=['en', 'hi']):
    global _reader
    if _reader is None:
        with _lock:
            if _reader is None:
                print(f"DEBUG: Initializing EasyOCR Reader for languages: {langs}")
                # Note: We use CPU specifically to avoid issues if GPU is busy/not found
                _reader = easyocr.Reader(langs, gpu=False)
    return _reader
