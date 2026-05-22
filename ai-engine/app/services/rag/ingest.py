import hashlib
import os
from pathlib import Path

from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.document_loaders import PyPDFLoader
from langchain_community.vectorstores import FAISS
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.embeddings import HuggingFaceEmbeddings

from app.core.logger import logger

KNOWLEDGE_BASE_DIR = "knowledge_base"
VECTOR_STORE_DIR = "vector_store"
HASH_FILE = "vector_store/hash.txt"


def calculate_pdf_hash():
    pdf_files = list(Path(KNOWLEDGE_BASE_DIR).glob("*.pdf"))

    combined = ""

    for pdf in pdf_files:
        combined += pdf.name
        combined += str(pdf.stat().st_mtime)

    return hashlib.md5(combined.encode()).hexdigest()


async def build_vector_store():
    pdf_files = list(Path(KNOWLEDGE_BASE_DIR).glob("*.pdf"))

    if not pdf_files:
        logger.warning("No PDF files found")
        return

    logger.info(f"Found {len(pdf_files)} PDF files")

    all_docs = []

    for pdf_path in pdf_files:
        logger.info(f"Loading PDF: {pdf_path.name}")

        loader = PyPDFLoader(str(pdf_path))
        docs = loader.load()

        for doc in docs:
            doc.metadata["source_file"] = pdf_path.name

        all_docs.extend(docs)

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_documents(all_docs)

    logger.info(f"Total chunks: {len(chunks)}")

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.from_documents(
        chunks,
        embeddings
    )

    os.makedirs(VECTOR_STORE_DIR, exist_ok=True)

    vectorstore.save_local(VECTOR_STORE_DIR)

    current_hash = calculate_pdf_hash()

    with open(HASH_FILE, "w") as f:
        f.write(current_hash)

    logger.info("FAISS vector store built successfully")


async def ensure_vector_store():
    index_file = Path(VECTOR_STORE_DIR) / "index.faiss"

    current_hash = calculate_pdf_hash()

    rebuild_needed = False

    if not index_file.exists():
        logger.info("Vector store not found")
        rebuild_needed = True

    elif not Path(HASH_FILE).exists():
        rebuild_needed = True

    else:
        with open(HASH_FILE, "r") as f:
            old_hash = f.read()

        if old_hash != current_hash:
            logger.info("Knowledge base changed")
            rebuild_needed = True

    if rebuild_needed:
        logger.info("Building vector store...")
        await build_vector_store()
    else:
        logger.info("Vector store already up-to-date")