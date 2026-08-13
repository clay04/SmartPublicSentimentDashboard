from app.core.logger import logger
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from app.services.rag.retriever import get_retriever
from app.services.llm.gemini_service import geminiLlm
from app.services.llm.groq_service import groq_llm

PROMPT = """
Anda adalah asisten AI yang membantu. Gunakan konteks berikut untuk menjawab pertanyaan pengguna.
Jika konteks tidak relevan, jawab berdasarkan pengetahuan Anda namun ingatkan bahwa informasi mungkin terbatas.

Konteks Regulasi / SOP Internal:
{context}

Konteks Berita Terkini dari Database:
{news_context_str}
"""

def _create_messages(question: str, context: str, news_context_str: str, chat_history: list[dict]) -> list:
    messages = [SystemMessage(content=PROMPT.format(context=context, news_context_str=news_context_str))]
    for msg in chat_history[-10:]:
        if msg.get("role") == "user":
            messages.append(HumanMessage(content=msg.get("text", "")))
        elif msg.get("role") == "assistant":
            messages.append(AIMessage(content=msg.get("text", "")))
        
    messages.append(HumanMessage(content=question))
    return messages

def sentiment_chat(question: str, chat_history: list[dict] = None, news_context: list[dict] = None) -> dict:
    if chat_history is None:
        chat_history = []

    if news_context is None:
        news_context = []

    # 1. Ambil regulasi dari Vector DB (RAG)
    retrivier = get_retriever()
    docs = retrivier.invoke(question)
    context = "\n\n".join([doc.page_content for doc in docs])

    source_document = None
    if docs:
        source_document = docs[0].metadata.get("source_file")

    # 🛠️ PERBAIKAN: Ubah list of dict news_context menjadi string yang rapi & terstruktur
    news_formatted_list = []
    for idx, news in enumerate(news_context, 1):
        news_formatted_list.append(
            f"Berita #{idx}:\n"
            f"- Judul: {news.get('title', 'Tanpa Judul')}\n"
            f"- Konten: {news.get('content', '')}\n"
            f"- Analisis Sentimen Publik: {news.get('sentiment', 'neutral')}"
        )
    
    # Jika tidak ada berita yang cocok dari MongoDB, berikan catatan kosong yang jelas
    news_context_str = "\n\n".join(news_formatted_list) if news_formatted_list else "Tidak ada berita terbaru yang relevan dengan topik ini."

    # 2. Susun pesan dengan string berita yang sudah rapi
    messages = _create_messages(question, context, news_context_str, chat_history)

    try:
        response = geminiLlm.invoke(messages)
        return {
            "status": "success",
            "answer": response.content,
            "source_document": source_document,
            "model_used": "Gemini 2.5 Flash"
        }
    except Exception as master_error:
        logger.warning(f"Master LLM Failed: {master_error}. Fallback to Groq LLM")
        try:
            response = groq_llm.invoke(messages)
            return {
                "status": "success",
                "answer": response.content,
                "source_document": source_document,
                "model_used": "Groq"
            }
        except Exception as fallback_error:
            logger.error(f"Both LLMs Failed: {fallback_error}")
            return {
                "status": "error",
                "answer": "Maaf, terjadi kesalahan pada sistem AI kami.",
                "source_document": None,
                "model_used": None
            }