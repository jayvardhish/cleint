import chromadb

import os
from typing import List, Dict, Optional
from utils.embedding_utils import generate_embeddings

# Initialize ChromaDB client
CHROMA_PATH = os.path.join(os.path.dirname(__file__), "chroma_db")
os.makedirs(CHROMA_PATH, exist_ok=True)

client = chromadb.PersistentClient(path=CHROMA_PATH)

# Create or get collection for video chunks
collection = client.get_or_create_collection(
    name="video_transcripts",
    metadata={"description": "Chunked video transcripts with embeddings"}
)

def store_video_chunks(
    video_id: str, 
    chunks: List[Dict], 
    use_openai_embeddings: bool = True
) -> int:
    """
    Store video chunks with embeddings in ChromaDB.
    
    Args:
        video_id: Unique identifier for the video
        chunks: List of chunk dicts from chunk_text()
        use_openai_embeddings: Whether to use OpenAI or local embeddings
    
    Returns:
        Number of chunks stored
    """
    if not chunks:
        return 0
    
    # Extract texts
    texts = [chunk['text'] for chunk in chunks]
    
    # Generate embeddings
    try:
        embeddings = generate_embeddings(texts, use_openai=use_openai_embeddings)
    except Exception as e:
        print(f"Embedding generation failed: {e}")
        # Fallback to local embeddings
        embeddings = generate_embeddings(texts, use_openai=False)
    
    # Prepare data for ChromaDB
    ids = [f"{video_id}_chunk_{chunk['id']}" for chunk in chunks]
    metadatas = [
        {
            "video_id": video_id,
            "chunk_id": chunk['id'],
            "token_count": chunk.get('token_count', 0),
            "start_token": chunk.get('start_token', 0),
            "end_token": chunk.get('end_token', 0)
        }
        for chunk in chunks
    ]
    
    # Store in ChromaDB
    collection.add(
        ids=ids,
        embeddings=embeddings,
        documents=texts,
        metadatas=metadatas
    )
    
    print(f"Stored {len(chunks)} chunks for video {video_id}")
    return len(chunks)

def retrieve_relevant_chunks(
    video_id: str, 
    query: str, 
    top_k: int = 5,
    use_openai_embeddings: bool = True
) -> List[Dict]:
    """
    Retrieve the most relevant chunks for a query using semantic search.
    
    Args:
        video_id: Video identifier to search within
        query: User's question or search query
        top_k: Number of chunks to retrieve
        use_openai_embeddings: Whether to use OpenAI embeddings for query
    
    Returns:
        List of dicts with 'text', 'metadata', 'distance'
    """
    # Generate query embedding
    try:
        query_embedding = generate_embeddings([query], use_openai=use_openai_embeddings)[0]
    except:
        query_embedding = generate_embeddings([query], use_openai=False)[0]
    
    # Query ChromaDB
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=top_k,
        where={"video_id": video_id}
    )
    
    # Format results
    chunks = []
    if results['documents'] and results['documents'][0]:
        for i, doc in enumerate(results['documents'][0]):
            chunks.append({
                'text': doc,
                'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                'distance': results['distances'][0][i] if results['distances'] else 0
            })
    
    return chunks

def delete_video_chunks(video_id: str) -> int:
    """
    Delete all chunks for a specific video.
    
    Args:
        video_id: Video identifier
    
    Returns:
        Number of chunks deleted
    """
    # Get all chunk IDs for this video
    results = collection.get(
        where={"video_id": video_id}
    )
    
    if results['ids']:
        collection.delete(ids=results['ids'])
        print(f"Deleted {len(results['ids'])} chunks for video {video_id}")
        return len(results['ids'])
    
    return 0

def get_video_chunk_count(video_id: str) -> int:
    """Get the number of chunks stored for a video."""
    results = collection.get(
        where={"video_id": video_id}
    )
    return len(results['ids']) if results['ids'] else 0
