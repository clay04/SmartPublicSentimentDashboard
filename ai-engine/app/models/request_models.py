from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    text: str = Field(
        ...,
        example="Jalan rusak parah di Surabaya menyebabkan kecelakaan"
    )

    source: str | None = Field(
        default="twitter",
        example="twitter"
    )