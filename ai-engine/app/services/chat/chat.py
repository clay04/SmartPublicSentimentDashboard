from app.core.logger import logger

from langchain_core.messages import (
    HumanMessage,
    AIMessage,
    SystemMessage,
)

from app.services.rag.retriever import get_retriever
from app.services.llm.gemini_service import get_gemini_llm
from app.services.llm.groq_service import groq_llm


PROMPT = """
Anda adalah asisten AI untuk Smart Public Sentiment Dashboard.

Tugas Anda adalah membantu pengguna memahami berita terkini berdasarkan
konteks berita yang diberikan dari database.

Gunakan konteks berita sebagai sumber utama ketika pertanyaan pengguna
berhubungan dengan berita.

Untuk setiap berita, tersedia informasi:

- ID berita
- Judul
- Lokasi
- Latitude
- Longitude
- Kategori
- Urgensi
- Sentimen publik
- Sumber
- Konten berita

Jangan mengarang informasi yang tidak terdapat dalam konteks berita.

Jika informasi yang ditanyakan tidak tersedia dalam konteks berita,
jelaskan bahwa informasi tersebut tidak ditemukan dalam berita yang tersedia.

Konteks Regulasi / SOP Internal:
{context}

Konteks Berita Terkini dari Database:
{news_context_str}
"""


def _create_messages(
    question: str,
    context: str,
    news_context_str: str,
    chat_history: list[dict]
) -> list:

    messages = [
        SystemMessage(
            content=PROMPT.format(
                context=context,
                news_context_str=news_context_str
            )
        )
    ]

    # Gunakan maksimal 10 pesan terakhir
    for msg in chat_history[-10:]:

        if msg.get("role") == "user":

            messages.append(
                HumanMessage(
                    content=msg.get("text", "")
                )
            )

        elif msg.get("role") == "assistant":

            messages.append(
                AIMessage(
                    content=msg.get("text", "")
                )
            )

    # Pertanyaan terbaru
    messages.append(
        HumanMessage(
            content=question
        )
    )

    return messages


def _build_map_action(news_context: list[dict]) -> dict | None:

    for news in news_context:

        latitude = news.get("latitude")
        longitude = news.get("longitude")

        if latitude is not None and longitude is not None:

            return {
                "type": "navigate",
                "latitude": latitude,
                "longitude": longitude,
                "zoom": 15
            }

    return None


async def sentiment_chat(
    question: str,
    chat_history: list[dict] | None = None,
    news_context: list[dict] | None = None
) -> dict:

    # =========================================================
    # 1. Default value
    # =========================================================

    if chat_history is None:
        chat_history = []

    if news_context is None:
        news_context = []


    # =========================================================
    # 2. Build map action
    # =========================================================

    map_action = _build_map_action(
        news_context
    )


    # =========================================================
    # 3. RAG - Ambil konteks regulasi
    # =========================================================

    retriever = get_retriever()

    docs = retriever.invoke(question)

    context = "\n\n".join(
        [
            doc.page_content
            for doc in docs
        ]
    )


    # =========================================================
    # 4. Source document
    # =========================================================

    source_document = None

    if docs:

        source_document = docs[0].metadata.get(
            "source_file"
        )


    # =========================================================
    # 5. Format news context
    # =========================================================

    news_formatted_list = []

    for idx, news in enumerate(
        news_context,
        1
    ):

        news_formatted_list.append(

            f"Berita #{idx}:\n"

            f"- ID: "
            f"{news.get('id', 'Tidak tersedia')}\n"

            f"- Judul: "
            f"{news.get('title', 'Tanpa Judul')}\n"

            f"- Lokasi: "
            f"{news.get('location', 'Tidak diketahui')}\n"

            f"- Latitude: "
            f"{news.get('latitude', 'Tidak tersedia')}\n"

            f"- Longitude: "
            f"{news.get('longitude', 'Tidak tersedia')}\n"

            f"- Kategori: "
            f"{news.get('category', 'Tidak diketahui')}\n"

            f"- Urgensi: "
            f"{news.get('urgency', 'Tidak diketahui')}\n"

            f"- Sentimen Publik: "
            f"{news.get('sentiment', 'Tidak diketahui')}\n"

            f"- Sumber: "
            f"{news.get('source', 'Tidak diketahui')}\n"

            f"- Konten: "
            f"{news.get('content', '')}"
        )


    if news_formatted_list:

        news_context_str = "\n\n".join(
            news_formatted_list
        )

    else:

        news_context_str = (
            "Tidak ada berita terbaru yang relevan "
            "dengan topik ini."
        )


    # =========================================================
    # 6. Create LLM messages
    # =========================================================

    messages = _create_messages(
        question=question,
        context=context,
        news_context_str=news_context_str,
        chat_history=chat_history
    )


    # =========================================================
    # 7. Gemini
    # =========================================================

    try:

        gemini_llm = await get_gemini_llm()

        response = await gemini_llm.ainvoke(
            messages
        )

        return {
            "status": "success",

            "answer": response.content,

            "source_document": source_document,

            "model_used": "Gemini 2.5 Flash",

            "map_action": map_action
        }


    except Exception as master_error:

        logger.warning(
            f"Master LLM Failed: {master_error}. "
            f"Fallback to Groq LLM"
        )


        # =====================================================
        # 8. Groq fallback
        # =====================================================

        try:

            response = await groq_llm.ainvoke(
                messages
            )

            return {
                "status": "success",

                "answer": response.content,

                "source_document": source_document,

                "model_used": "Groq",

                "map_action": map_action
            }


        except Exception as fallback_error:

            logger.error(
                f"Both LLMs Failed: "
                f"{fallback_error}"
            )


            # =================================================
            # 9. Error response
            # =================================================

            return {
                "status": "error",

                "answer": (
                    "Maaf, terjadi kesalahan "
                    "pada sistem AI kami."
                ),

                "source_document": None,

                "model_used": None,

                "map_action": None
            }