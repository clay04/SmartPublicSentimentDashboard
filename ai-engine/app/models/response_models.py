from typing import Optional
from pydantic import BaseModel, Field

# Skema KETAT untuk LLM (Hanya data yang perlu diperas dari teks)
class LLMAnalysisOutput(BaseModel):
    sentiment: str = Field(description="Sentimen dari teks: positive, neutral, atau negative")
    category: str = Field(description="Kategori aduan, contoh: infrastruktur, kesehatan, dll")
    urgency: str = Field(description="Tingkat urgensi: low, medium, atau high")
    recommendation: str = Field(description="Rekomendasi tindakan berdasarkan dokumen SOP")
    regulation_context: str = Field(description="Kutipan regulasi/SOP yang relevan dari konteks")
    location: Optional[str] = Field(default=None, description="Nama kota, kecamatan, provinsi, atau tempat spesifik yang disebutkan")

# Skema Lengkap untuk Response API & Cache Redis
class AnalyzeResponse(LLMAnalysisOutput):
    source_document: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None