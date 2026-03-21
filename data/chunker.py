"""
Article Chunker for ET Intelligence.
Splits articles into overlapping chunks for RAG retrieval.
Uses LangChain's RecursiveCharacterTextSplitter for smart chunking.
"""
import json
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter

DATA_DIR = Path(__file__).parent
ARTICLES_PATH = DATA_DIR / "articles.json"
CHUNKS_PATH = DATA_DIR / "chunks.json"

# Chunking parameters
CHUNK_SIZE = 400        # characters per chunk
CHUNK_OVERLAP = 80      # overlap between consecutive chunks

# LangChain text splitter — handles sentence/word boundaries automatically
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=CHUNK_SIZE,
    chunk_overlap=CHUNK_OVERLAP,
    length_function=len,
    separators=["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " ", ""],
)


def chunk_articles(articles: list[dict]) -> list[dict]:
    """
    Process articles into chunks with metadata using LangChain splitter.
    """
    all_chunks = []
    chunk_counter = 0

    for article in articles:
        body = article.get("body", "")
        if not body or len(body) < 50:
            continue

        text_chunks = text_splitter.split_text(body)

        for i, chunk_text in enumerate(text_chunks):
            chunk_counter += 1
            all_chunks.append({
                "chunk_id": f"chunk_{chunk_counter:04d}",
                "article_id": article.get("id", ""),
                "title": article.get("title", ""),
                "date": article.get("published_at", ""),
                "url": article.get("url", ""),
                "topic": article.get("topic", ""),
                "text": chunk_text.strip(),
                "chunk_index": i,
            })

    return all_chunks


def main():
    # Load articles
    if not ARTICLES_PATH.exists():
        print(f"✗ No articles.json found at {ARTICLES_PATH}")
        print("  Run scraper.py first: python data/scraper.py")
        return

    with open(ARTICLES_PATH, "r", encoding="utf-8") as f:
        articles = json.load(f)

    print(f"Loaded {len(articles)} articles")

    # Chunk all articles
    chunks = chunk_articles(articles)
    print(f"Generated {len(chunks)} chunks")

    # Stats
    topics = {}
    for c in chunks:
        t = c["topic"]
        topics[t] = topics.get(t, 0) + 1
    print("\nChunks per topic:")
    for topic, count in sorted(topics.items()):
        print(f"  {topic}: {count}")

    # Save
    with open(CHUNKS_PATH, "w", encoding="utf-8") as f:
        json.dump(chunks, f, indent=2, ensure_ascii=False)

    print(f"\n✓ Saved {len(chunks)} chunks to {CHUNKS_PATH}")

    # Preview a sample chunk
    if chunks:
        sample = chunks[0]
        print(f"\n── Sample chunk ──")
        print(f"ID: {sample['chunk_id']}")
        print(f"Article: {sample['title'][:60]}")
        print(f"Topic: {sample['topic']}")
        print(f"Text: {sample['text'][:150]}...")


if __name__ == "__main__":
    main()
