from dataclasses import dataclass
from uuid import UUID

import chromadb
from openai import (
    APIConnectionError,
    APIStatusError,
    AuthenticationError,
    OpenAI,
    RateLimitError,
)

from backend.app.core.errors import VectorIndexError
from backend.app.core.settings import get_settings
from backend.app.utilities.text_chunks import split_text_into_chunks


@dataclass(frozen=True, slots=True)
class RetrievedChunk:
    chunk_id: int
    text: str
    relevance_score: float | None


class VectorService:
    def __init__(self) -> None:
        settings = get_settings()

        if not settings.openai_api_key:
            raise VectorIndexError(
                "OPENAI_API_KEY is missing from the root .env file."
            )

        self._embedding_model = settings.embedding_model
        self._openai_client = OpenAI(
            api_key=settings.openai_api_key,
        )

        self._chroma_client = chromadb.PersistentClient(
            path=str(settings.vectors_directory),
        )

    def build_index(
        self,
        run_id: str,
        transcript_markdown: str,
    ) -> int:
        chunks = split_text_into_chunks(
            transcript_markdown,
            max_words=450,
            overlap_words=60,
        )

        if not chunks:
            raise VectorIndexError(
                "The transcript contains no text to index."
            )

        collection = self._get_collection(run_id)

        existing_count = collection.count()

        if existing_count > 0:
            return existing_count

        embeddings = self._embed_texts(chunks)

        ids = [
            f"{self._collection_name(run_id)}-chunk-{index}"
            for index in range(1, len(chunks) + 1)
        ]

        metadatas = [
            {
                "run_id": run_id,
                "chunk_id": index,
            }
            for index in range(1, len(chunks) + 1)
        ]

        try:
            collection.add(
                ids=ids,
                documents=chunks,
                metadatas=metadatas,
                embeddings=embeddings,
            )

        except Exception as error:
            raise VectorIndexError(
                "Transcript vectors could not be stored."
            ) from error

        return len(chunks)

    def search(
        self,
        run_id: str,
        question: str,
        limit: int = 5,
    ) -> list[RetrievedChunk]:
        collection = self._get_collection(run_id)

        if collection.count() == 0:
            raise VectorIndexError(
                "The vector index has not been built for this run."
            )

        query_embedding = self._embed_texts([question])[0]

        try:
            result = collection.query(
                query_embeddings=[query_embedding],
                n_results=limit,
                include=[
                    "documents",
                    "metadatas",
                    "distances",
                ],
            )

        except Exception as error:
            raise VectorIndexError(
                "Transcript vectors could not be searched."
            ) from error

        documents = result.get("documents", [[]])[0]
        metadatas = result.get("metadatas", [[]])[0]
        distances = result.get("distances", [[]])[0]

        chunks: list[RetrievedChunk] = []

        for document, metadata, distance in zip(
            documents,
            metadatas,
            distances,
        ):
            chunk_id = int(metadata.get("chunk_id", 0))
            relevance_score = (
                1 - float(distance)
                if distance is not None
                else None
            )

            chunks.append(
                RetrievedChunk(
                    chunk_id=chunk_id,
                    text=str(document),
                    relevance_score=relevance_score,
                )
            )

        return chunks

    def _embed_texts(
        self,
        texts: list[str],
    ) -> list[list[float]]:
        try:
            response = self._openai_client.embeddings.create(
                model=self._embedding_model,
                input=texts,
            )

        except AuthenticationError as error:
            raise VectorIndexError(
                "The OpenAI API key was rejected."
            ) from error

        except RateLimitError as error:
            raise VectorIndexError(
                "The embedding request was rate-limited."
            ) from error

        except APIConnectionError as error:
            raise VectorIndexError(
                "The backend could not connect to OpenAI for embeddings."
            ) from error

        except APIStatusError as error:
            raise VectorIndexError(
                f"OpenAI returned embedding API error {error.status_code}."
            ) from error

        except Exception as error:
            raise VectorIndexError(
                "The embedding request failed unexpectedly."
            ) from error

        return [
            item.embedding
            for item in response.data
        ]

    def _get_collection(
        self,
        run_id: str,
    ):
        return self._chroma_client.get_or_create_collection(
            name=self._collection_name(run_id),
            metadata={
                "hnsw:space": "cosine",
            },
        )

    @staticmethod
    def _collection_name(run_id: str) -> str:
        validated_id = UUID(run_id)

        return f"run_{validated_id.hex}"
