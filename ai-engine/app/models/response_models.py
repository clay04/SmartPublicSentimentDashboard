from pydantic import BaseModel, Field


class AnalyzeResponse(BaseModel):
    sentiment: str = Field(
        example="negative"
    )

    category: str = Field(
        example="infrastruktur"
    )

    urgency: str = Field(
        example="high"
    )

    recommendation: str = Field(
        example="Segera lakukan inspeksi dan perbaikan jalan."
    )

    regulation_context: str = Field(
        example="Mengacu pada SOP penanganan jalan rusak..."
    )