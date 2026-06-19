from openai import (
    APIConnectionError,
    APIStatusError,
    AuthenticationError,
    OpenAI,
    RateLimitError,
)

from backend.app.core.errors import ChatGenerationError
from backend.app.core.settings import get_settings
from backend.app.models.chat import (
    ChatResponse,
    ChatSource,
)
from backend.app.services.vector_service import (
    VectorService,
)


class ChatService:
    def __init__(self) -> None:
        settings = get_settings()

        if not settings.openai_api_key:
            raise ChatGenerationError(
                "OPENAI_API_KEY is missing from the root .env file."
            )

        self._model = settings.openai_model
        self._client = OpenAI(
            api_key=settings.openai_api_key,
        )
        self._vector_service = VectorService()

    def answer_question(
        self,
        run_id: str,
        question: str,
    ) -> ChatResponse:
        chunks = self._vector_service.search(
            run_id=run_id,
            question=question,
            limit=5,
        )

        if not chunks:
            return ChatResponse(
                answer=(
                    "I could not find relevant transcript evidence "
                    "to answer that question."
                ),
                is_relevant=False,
                sources=[],
            )

        context = "\n\n".join(
            f"[Chunk {chunk.chunk_id}]\n{chunk.text}"
            for chunk in chunks
        )

        prompt = f"""
Answer the user's question using only the transcript evidence below.

Rules:
- If the evidence is insufficient, say that the transcript does not provide enough information.
- Do not invent facts.
- Be direct and concise.
- Mention relevant chunk numbers where useful.

Question:
{question}

Transcript evidence:
{context}
""".strip()

        try:
            response = self._client.responses.create(
                model=self._model,
                instructions=(
                    "You are a grounded video-analysis assistant. "
                    "You answer only from the retrieved transcript chunks. "
                    "You do not use outside knowledge."
                ),
                input=prompt,
                max_output_tokens=700,
            )

        except AuthenticationError as error:
            raise ChatGenerationError(
                "The OpenAI API key was rejected."
            ) from error

        except RateLimitError as error:
            raise ChatGenerationError(
                "The chat request was rate-limited."
            ) from error

        except APIConnectionError as error:
            raise ChatGenerationError(
                "The backend could not connect to OpenAI."
            ) from error

        except APIStatusError as error:
            raise ChatGenerationError(
                f"OpenAI returned chat API error {error.status_code}."
            ) from error

        except Exception as error:
            raise ChatGenerationError(
                "The chat request failed unexpectedly."
            ) from error

        answer = response.output_text.strip()

        return ChatResponse(
            answer=answer,
            is_relevant=True,
            sources=[
                ChatSource(
                    chunk_id=chunk.chunk_id,
                    text=chunk.text,
                    relevance_score=chunk.relevance_score,
                )
                for chunk in chunks
            ],
        )
