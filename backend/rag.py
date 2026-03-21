"""
RAG (Retrieval-Augmented Generation) module.
Handles embedding queries and searching ChromaDB for relevant article chunks.
Uses sentence-transformers for embeddings (FREE, local, no API key needed).
"""
from pathlib import Path
from typing import Optional

import chromadb
from sentence_transformers import SentenceTransformer

# ChromaDB client
CHROMA_PATH = str(Path(__file__).parent.parent / "chroma_db")
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

# Sentence-transformers model (same model used during embedding)
COLLECTION_NAME = "et_articles"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Lazy-load the model (loaded on first query)
_model = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model


def get_embedding(text: str) -> list[float]:
    """Get embedding vector for a text string using sentence-transformers."""
    model = _get_model()
    return model.encode(text).tolist()


def retrieve(query: str, n: int = 8, topic: Optional[str] = None) -> list[dict]:
    """
    Retrieve the top-n most relevant chunks from ChromaDB for a given query.
    
    Returns a list of dicts: {text, title, date, url, topic, score}
    """
    try:
        collection = chroma_client.get_collection(name=COLLECTION_NAME)
    except Exception:
        return []

    query_embedding = get_embedding(query)

    # Build query kwargs
    query_kwargs = {
        "query_embeddings": [query_embedding],
        "n_results": n,
        "include": ["documents", "metadatas", "distances"],
    }

    # Optional topic filter
    if topic:
        query_kwargs["where"] = {"topic": topic}

    results = collection.query(**query_kwargs)

    chunks = []
    if results and results["documents"] and results["documents"][0]:
        for i, doc in enumerate(results["documents"][0]):
            metadata = results["metadatas"][0][i] if results["metadatas"] else {}
            distance = results["distances"][0][i] if results["distances"] else 0
            # ChromaDB returns L2 distance; convert to similarity score (lower = more similar)
            score = round(1 / (1 + distance), 4)
            chunks.append({
                "text": doc,
                "title": metadata.get("title", ""),
                "date": metadata.get("date", ""),
                "url": metadata.get("url", ""),
                "topic": metadata.get("topic", ""),
                "score": score,
            })

    return chunks
