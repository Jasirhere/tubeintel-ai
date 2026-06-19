from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    question: str = Field(
        min_length=2,
        max_length=1000,
    )


class ChatSource(BaseModel):
    chunk_id: int
    text: str
    relevance_score: float | None = None


class ChatResponse(BaseModel):
    answer: str
    is_relevant: bool
    sources: list[ChatSource] = Field(default_factory=list)