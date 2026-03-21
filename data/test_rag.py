"""
RAG Test Script for ET Intelligence.
Tests that ChromaDB returns relevant chunks for sample queries.
Uses sentence-transformers (local, free).
"""
import sys
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

CHROMA_PATH = str(Path(__file__).parent.parent / "chroma_db")
COLLECTION_NAME = "et_articles"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

# Demo queries to test
TEST_QUERIES = [
    "What did the Union Budget announce for mutual funds?",
    "What is SEBI doing about algo trading?",
    "Explain RBI rate decision impact on home loans",
    "Tell me about Zepto IPO valuation",
]


def main():
    print(f"Loading embedding model: {EMBEDDING_MODEL}...")
    model = SentenceTransformer(EMBEDDING_MODEL)
    
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

    try:
        collection = chroma_client.get_collection(name=COLLECTION_NAME)
    except Exception:
        print("X Collection not found. Run embed.py first: python data/embed.py")
        return

    print(f"ChromaDB collection has {collection.count()} chunks\n")

    for query in TEST_QUERIES:
        print(f"=== Query: {query} ===")
        query_embedding = model.encode(query).tolist()

        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=5,
            include=["documents", "metadatas", "distances"],
        )

        if results["documents"] and results["documents"][0]:
            for i, (doc, meta, dist) in enumerate(
                zip(
                    results["documents"][0],
                    results["metadatas"][0],
                    results["distances"][0],
                )
            ):
                score = round(1 / (1 + dist), 4)
                print(f"\n  #{i+1} (score: {score})")
                print(f"  Title: {meta.get('title', '')[:60]}")
                print(f"  Topic: {meta.get('topic', '')}")
                print(f"  Text:  {doc[:120]}...")
        else:
            print("  No results found.")

        print()


if __name__ == "__main__":
    main()
