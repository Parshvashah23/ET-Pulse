"""
Embedding + ChromaDB Ingestion for ET Intelligence.
Loads chunks.json → embeds via sentence-transformers (FREE, local) → stores in ChromaDB.
Uses all-MiniLM-L6-v2 model — runs entirely offline, no API key needed.
"""
import json
import time
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

DATA_DIR = Path(__file__).parent
CHUNKS_PATH = DATA_DIR / "chunks.json"
CHROMA_PATH = str(Path(__file__).parent.parent / "chroma_db")

COLLECTION_NAME = "et_articles"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"  # Free, local, fast
BATCH_SIZE = 50


def main():
    # Load chunks
    if not CHUNKS_PATH.exists():
        print(f"X No chunks.json found at {CHUNKS_PATH}")
        print("  Run chunker.py first: python data/chunker.py")
        return

    with open(CHUNKS_PATH, "r", encoding="utf-8") as f:
        chunks = json.load(f)

    print(f"Loaded {len(chunks)} chunks")

    # Initialize sentence-transformers model (downloads ~90MB on first run)
    print(f"Loading embedding model: {EMBEDDING_MODEL}...")
    model = SentenceTransformer(EMBEDDING_MODEL)
    print("Model loaded!")

    # Initialize ChromaDB
    chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)

    # Create/reset collection
    try:
        chroma_client.delete_collection(name=COLLECTION_NAME)
        print("Deleted existing collection")
    except Exception:
        pass

    collection = chroma_client.create_collection(
        name=COLLECTION_NAME,
        metadata={"description": "ET Intelligence article chunks"},
    )

    # Process in batches
    total_batches = (len(chunks) + BATCH_SIZE - 1) // BATCH_SIZE
    print(f"Processing {total_batches} batches...")

    for batch_idx in range(0, len(chunks), BATCH_SIZE):
        batch = chunks[batch_idx : batch_idx + BATCH_SIZE]
        batch_num = batch_idx // BATCH_SIZE + 1

        texts = [c["text"] for c in batch]
        ids = [c["chunk_id"] for c in batch]
        metadatas = [
            {
                "article_id": c["article_id"],
                "title": c["title"],
                "date": c["date"],
                "url": c["url"],
                "topic": c["topic"],
                "chunk_index": c["chunk_index"],
            }
            for c in batch
        ]

        # Get embeddings locally — FREE!
        embeddings = model.encode(texts, show_progress_bar=False).tolist()

        # Add to ChromaDB
        collection.add(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )

        print(f"  [OK] Batch {batch_num}/{total_batches}: {len(batch)} chunks embedded")

    # Verify
    count = collection.count()
    print(f"\n=== ChromaDB collection '{COLLECTION_NAME}' has {count} chunks ===")


if __name__ == "__main__":
    main()
