import logging
from backend.app.services.vector_service import VectorService
from backend.app.services.pdf_service import PdfService
from backend.app.core.errors import (
    InvalidYouTubeUrlError,
    RunStorageError,
    SummaryGenerationError,
    TranscriptUnavailableError,
)
from backend.app.services.summary_service import (
    SummaryService,
)
from backend.app.services.transcript_service import (
    fetch_transcript,
)
from backend.app.storage.run_repository import (
    RunRepository,
)


logger = logging.getLogger(__name__)


def process_analysis_run(
    run_id: str,
    youtube_url: str,
    preferred_languages: list[str],
    summary_style: str,
    optional_notes: str,
) -> None:
    repository = RunRepository()

    try:
        repository.update_run(
            run_id,
            status="extracting_transcript",
            progress=10,
            message="Extracting transcript from YouTube.",
            error=None,
        )

        document = fetch_transcript(
            youtube_url=youtube_url,
            preferred_languages=preferred_languages,
        )

        repository.update_run(
            run_id,
            progress=25,
            message="Transcript extracted. Saving transcript files.",
            video_id=document.video_id,
        )

        repository.save_transcript(
            run_id=run_id,
            document=document,
        )

        repository.update_run(
            run_id,
            status="transcript_ready",
            progress=35,
            message="Transcript saved successfully.",
            video_id=document.video_id,
            language=document.language,
            language_code=document.language_code,
            is_generated=document.is_generated,
            segment_count=len(document.segments),
            character_count=len(document.full_text),
            thumbnail_url=document.thumbnail_url,
            transcript_preview=document.preview,
            error=None,
        )

        transcript = repository.read_transcript_markdown(
            run_id
        )

        repository.update_run(
            run_id,
            status="indexing_transcript",
            progress=38,
            message="Building the searchable transcript index.",
        )

        vector_chunk_count = VectorService().build_index(
            run_id=run_id,
            transcript_markdown=transcript,
        )

        repository.update_run(
            run_id,
            status="rag_ready",
            progress=40,
            message="Searchable transcript index is ready.",
            vector_chunk_count=vector_chunk_count,
        )

        repository.update_run(
            run_id,
            status="summarizing_chunks",
            progress=42,
            message="Preparing transcript sections for analysis.",
            completed_chunks=0,
        )

        summary_service = SummaryService()

        def update_chunk_progress(
            completed_chunks: int,
            total_chunks: int,
        ) -> None:
            chunk_progress = int(
                42
                + (
                    completed_chunks
                    / max(total_chunks, 1)
                )
                * 28
            )

            repository.update_run(
                run_id,
                status="summarizing_chunks",
                progress=min(chunk_progress, 70),
                message=(
                    f"Analysed transcript section "
                    f"{completed_chunks} of {total_chunks}."
                ),
                chunk_count=total_chunks,
                completed_chunks=completed_chunks,
            )

        result = summary_service.generate_report(
            transcript=transcript,
            summary_style=summary_style,
            optional_notes=optional_notes,
            progress_callback=update_chunk_progress,
        )

        repository.update_run(
            run_id,
            status="composing_report",
            progress=75,
            message="Composing the final structured report.",
            chunk_count=result.chunk_count,
            completed_chunks=result.chunk_count,
        )

        repository.save_summary(
            run_id=run_id,
            summary_markdown=result.markdown,
            chunk_summaries=list(result.chunk_summaries),
        )

        repository.update_run(
            run_id,
            status="summary_ready",
            progress=80,
            message="Summary completed successfully.",
            summary_preview=result.markdown[:1500],
            transcript_file=(
                f"/api/runs/{run_id}/transcript"
            ),
            summary_file=(
                f"/api/runs/{run_id}/summary"
            ),
            error=None,
        )

        repository.update_run(
            run_id,
            status="generating_pdf",
            progress=90,
            message="Generating the PDF report.",
        )

        pdf_destination = repository.get_artifact_path(
            run_id,
            "summary.pdf",
        )

        PdfService().generate_report(
            summary_markdown=result.markdown,
            destination=pdf_destination,
            video_id=document.video_id,
        )

        repository.update_run(
            run_id,
            status="completed",
            progress=100,
            message="Analysis and report generation completed.",
            transcript_file=(
                f"/api/runs/{run_id}/transcript"
            ),
            summary_file=(
                f"/api/runs/{run_id}/summary"
            ),
            pdf_file=(
                f"/api/runs/{run_id}/pdf"
            ),
            error=None,
        )

    except (
        InvalidYouTubeUrlError,
        TranscriptUnavailableError,
        SummaryGenerationError,
    ) as error:
        repository.update_run(
            run_id,
            status="failed",
            progress=100,
            message="The analysis run failed.",
            error=str(error),
        )

    except RunStorageError as error:
        logger.exception(
            "Storage failure while processing run %s",
            run_id,
        )

        try:
            repository.update_run(
                run_id,
                status="failed",
                progress=100,
                message="The run files could not be saved.",
                error=str(error),
            )

        except RunStorageError:
            logger.exception(
                "Could not record storage failure for run %s",
                run_id,
            )

    except Exception:
        logger.exception(
            "Unexpected failure while processing run %s",
            run_id,
        )

        try:
            repository.update_run(
                run_id,
                status="failed",
                progress=100,
                message="An unexpected backend error occurred.",
                error="Unexpected backend error.",
            )

        except RunStorageError:
            logger.exception(
                "Could not record unexpected failure for run %s",
                run_id,
            )
