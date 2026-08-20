from typing import Literal, Optional
from pydantic import BaseModel, Field

class LLMAnalysisOutput(BaseModel):
    sentiment: Literal["positive", "neutral", "negative"] = Field(
        description="Sentimen dari teks: positive, neutral, atau negative"
    )
    category: str = Field(
        description="Kategori aduan, contoh: infrastruktur, kesehatan, bencana_alam, dll"
    )
    urgency: Literal["low", "medium", "high"] = Field(
        description="Tingkat urgensi: low, medium, atau high"
    )
    recommendation: str = Field(
        default="",
        description="Rekomendasi tindakan singkat dalam Bahasa Indonesia, maksimal 2 kalimat"
    )
    regulation_context: str = Field(
        default="",
        description="Kutipan regulasi/SOP yang relevan, kosongkan jika tidak ada"
    )
    location: str = Field(
        default="",
        description="Nama kota, kecamatan, provinsi, atau tempat spesifik yang disebutkan. Gunakan string kosong \"\" jika tidak ada"
    )

class AnalyzeResponse(BaseModel):
    sentiment: str
    category: str
    urgency: str
    recommendation: str
    regulation_context: str
    location: Optional[str] = None
    source_document: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None