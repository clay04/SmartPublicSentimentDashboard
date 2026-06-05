from typing import Optional
from pydantic import BaseModel, Field


class AnalyzeResponse(BaseModel):
    sentiment: str = Field(json_schema_extra={"examples": ["negative"]})
    category: str = Field(json_schema_extra={"examples": ["infrastruktur"]})
    urgency: str = Field(json_schema_extra={"examples": ["high"]})
    recommendation: str = Field(json_schema_extra={"examples": ["Segera lakukan inspeksi..."]})
    regulation_context: str = Field(json_schema_extra={"examples": ["Mengacu pada SOP..."]})
    
    source_document: Optional[str] = Field(
        default=None, 
        description="File SOP/regulasi yang dijadikan acuan oleh RAG"
    )
    
    location: Optional[str] = None

    latitude: Optional[float] = None
    longitude: Optional[float] = None
    
    