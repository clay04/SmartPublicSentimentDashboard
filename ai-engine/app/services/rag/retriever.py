from langchain_community.vectorstores import FAISS
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings
from pathlib import Path

VECTOR_STORE_DIR = "vector_store"

_embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-MiniLM-L6-v2"
)

_vectorstore = None


def get_retriever():
    global _vectorstore

    if _vectorstore is None:
        index_path = Path(VECTOR_STORE_DIR) / "index.faiss"

        if not index_path.exists():
            raise RuntimeError("FAISS index not found. Run ingest first.")

        _vectorstore = FAISS.load_local(
            VECTOR_STORE_DIR,
            _embeddings,
            allow_dangerous_deserialization=True
        )

    return _vectorstore.as_retriever(search_kwargs={"k": 3})