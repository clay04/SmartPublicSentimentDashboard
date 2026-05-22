from pydantic import BaseModel, Field


class AnalyzeRequest(BaseModel):
    title: str
    content: str
    keyword: str
    source: str