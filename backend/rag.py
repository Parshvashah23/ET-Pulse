"""
RAG (Retrieval-Augmented Generation) module.
Handles fetching live news from NewsData.io and formatting it as "chunks" for the AI context window.
Includes a seamless ChromaDB fallback for API limits.
"""
import os
import json
import urllib.request
import urllib.parse
from pathlib import Path
from typing import Optional

import chromadb
from sentence_transformers import SentenceTransformer

# Initialize ChromaDB fallback
CHROMA_PATH = str(Path(__file__).parent.parent / "chroma_db")
chroma_client = chromadb.PersistentClient(path=CHROMA_PATH)
COLLECTION_NAME = "et_articles"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"

_model = None

def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer(EMBEDDING_MODEL)
    return _model

def retrieve(query: str, n: int = 5, topic: Optional[str] = None, offset: int = 0) -> list[dict]:
    """
    Retrieve live news articles from NewsData.io matching the query.
    Enforces english language and indian region to match user preferences.
    Falls back to ChromaDB if the API limit is hit or network fails.
    
    Returns a list of dicts: {text, title, date, url, topic, score}
    """
    api_key = os.getenv("NEWSDATA_API_KEY", "pub_9a2a0a985f80452fab68846aeac9d0ed")
    safe_query = urllib.parse.quote(query)
    
    # We restrict to language=en and country=in as requested
    url = f"https://newsdata.io/api/1/news?apikey={api_key}&q={safe_query}&language=en&country=in"
    
    results = []
    fetch_success = False
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
        
        if data.get("status") == "error":
            raise Exception(f"API Error: {data.get('results', {}).get('message', 'Unknown Error')}")
            
        fetched = data.get("results", [])
        if fetched:
            results = fetched
            fetch_success = True
        else:
            raise Exception("No results returned by API.")
            
    except Exception as e:
        print(f"Error fetching from NewsData, falling back to ChromaDB: {e}")
        fetch_success = False
    
    chunks = []
    
    if fetch_success:
        # We got results from the API. We slice by offset.
        sliced_results = results[offset : offset + n]
            
        for article in sliced_results:
            title = article.get("title") or ""
            desc = article.get("description") or ""
            content = article.get("content") or ""
            
            full_text = f"{desc}\n{content}".strip()
            
            if len(full_text) > 1500:
                full_text = full_text[:1500] + "..."
                
            cat = article.get("category", [])
            topic_str = cat[0] if isinstance(cat, list) and cat else (topic or "news")
                
            chunks.append({
                "text": full_text if full_text else "No content available.",
                "title": title,
                "date": article.get("pubDate", ""),
                "url": article.get("link", ""),
                "topic": str(topic_str),
                "score": 1.0
            })
    else:
        # FALLBACK: CHROMA DB
        try:
            collection = chroma_client.get_collection(name=COLLECTION_NAME)
            model = _get_model()
            query_embedding = model.encode(query).tolist()
            
            query_kwargs = {
                "query_embeddings": [query_embedding],
                "n_results": offset + n, 
                "include": ["documents", "metadatas", "distances"],
            }
            if topic:
                query_kwargs["where"] = {"topic": topic}
                
            db_results = collection.query(**query_kwargs)
            
            if db_results and db_results["documents"] and db_results["documents"][0]:
                docs = db_results["documents"][0][offset:]
                metas = db_results["metadatas"][0][offset:] if db_results["metadatas"] else []
                dists = db_results["distances"][0][offset:] if db_results["distances"] else []
                
                for i, doc in enumerate(docs):
                    metadata = metas[i] if len(metas) > i else {}
                    distance = dists[i] if len(dists) > i else 0
                    score = round(1 / (1 + distance), 4)
                    chunks.append({
                        "text": doc,
                        "title": metadata.get("title", ""),
                        "date": metadata.get("date", ""),
                        "url": metadata.get("url", ""),
                        "topic": metadata.get("topic", ""),
                        "score": score,
                    })
        except Exception as db_e:
            print(f"ChromaDB Fallback failed: {db_e}")
            
    return chunks[:n]
