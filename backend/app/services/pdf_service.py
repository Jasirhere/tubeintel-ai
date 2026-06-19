from datetime import datetime, timezone
from html import escape
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    ParagraphStyle,
    getSampleStyleSheet,
)
from reportlab.lib.units import mm
from reportlab.pdfgen.canvas import Canvas
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
)

from backend.app.core.errors import RunStorageError


class PdfService:
    def generate_report(
        self,
        summary_markdown: str,
        destination: Path,
        video_title: str,
        video_id: str | None = None,
    ) -> Path:
        destination.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        styles = self._create_styles()

        document = SimpleDocTemplate(
            str(destination),
            pagesize=A4,
            rightMargin=18 * mm,
            leftMargin=18 * mm,
            topMargin=20 * mm,
            bottomMargin=20 * mm,
            title=f"{video_title} - Summary",
            author="TubeIntel",
        )

        story = self._markdown_to_flowables(
            markdown=summary_markdown,
            styles=styles,
        )

        if video_id:
            story.insert(
                1,
                Paragraph(
                    f"Video ID: {escape(video_id)}",
                    styles["Metadata"],
                ),
            )

            story.insert(
                2,
                Spacer(1, 5 * mm),
            )

        try:
            document.build(
                story,
                onFirstPage=self._draw_page_footer,
                onLaterPages=self._draw_page_footer,
            )

        except Exception as error:
            raise RunStorageError(
                "The PDF report could not be generated."
            ) from error

        return destination

    @staticmethod
    def _create_styles() -> dict[str, ParagraphStyle]:
        sample_styles = getSampleStyleSheet()

        return {
            "Title": ParagraphStyle(
                "TubeIntelTitle",
                parent=sample_styles["Title"],
                fontName="Helvetica-Bold",
                fontSize=22,
                leading=27,
                spaceAfter=14,
                alignment=TA_CENTER,
                textColor=colors.HexColor("#111827"),
            ),
            "Heading1": ParagraphStyle(
                "TubeIntelHeading1",
                parent=sample_styles["Heading1"],
                fontName="Helvetica-Bold",
                fontSize=16,
                leading=20,
                spaceBefore=12,
                spaceAfter=8,
                textColor=colors.HexColor("#111827"),
            ),
            "Heading2": ParagraphStyle(
                "TubeIntelHeading2",
                parent=sample_styles["Heading2"],
                fontName="Helvetica-Bold",
                fontSize=13,
                leading=17,
                spaceBefore=10,
                spaceAfter=6,
                textColor=colors.HexColor("#1F2937"),
            ),
            "Heading3": ParagraphStyle(
                "TubeIntelHeading3",
                parent=sample_styles["Heading3"],
                fontName="Helvetica-Bold",
                fontSize=11,
                leading=15,
                spaceBefore=8,
                spaceAfter=5,
                textColor=colors.HexColor("#374151"),
            ),
            "Body": ParagraphStyle(
                "TubeIntelBody",
                parent=sample_styles["BodyText"],
                fontName="Helvetica",
                fontSize=10,
                leading=15,
                spaceAfter=7,
                textColor=colors.HexColor("#1F2937"),
            ),
            "Bullet": ParagraphStyle(
                "TubeIntelBullet",
                parent=sample_styles["BodyText"],
                fontName="Helvetica",
                fontSize=10,
                leading=15,
                leftIndent=12,
                firstLineIndent=-7,
                bulletIndent=2,
                spaceAfter=4,
                textColor=colors.HexColor("#1F2937"),
            ),
            "Metadata": ParagraphStyle(
                "TubeIntelMetadata",
                parent=sample_styles["BodyText"],
                fontName="Helvetica",
                fontSize=8,
                leading=11,
                alignment=TA_CENTER,
                textColor=colors.HexColor("#6B7280"),
            ),
        }

    def _markdown_to_flowables(
        self,
        markdown: str,
        styles: dict[str, ParagraphStyle],
    ) -> list:
        story: list = []
        paragraph_lines: list[str] = []

        def flush_paragraph() -> None:
            if not paragraph_lines:
                return

            paragraph = " ".join(paragraph_lines).strip()

            if paragraph:
                story.append(
                    Paragraph(
                        self._inline_markdown(paragraph),
                        styles["Body"],
                    )
                )

            paragraph_lines.clear()

        for raw_line in markdown.splitlines():
            line = raw_line.strip()

            if not line:
                flush_paragraph()
                continue

            if line.startswith("# "):
                flush_paragraph()
                story.append(
                    Paragraph(
                        self._inline_markdown(line[2:]),
                        styles["Title"],
                    )
                )
                continue

            if line.startswith("## "):
                flush_paragraph()
                story.append(
                    Paragraph(
                        self._inline_markdown(line[3:]),
                        styles["Heading1"],
                    )
                )
                continue

            if line.startswith("### "):
                flush_paragraph()
                story.append(
                    Paragraph(
                        self._inline_markdown(line[4:]),
                        styles["Heading2"],
                    )
                )
                continue

            if line.startswith("#### "):
                flush_paragraph()
                story.append(
                    Paragraph(
                        self._inline_markdown(line[5:]),
                        styles["Heading3"],
                    )
                )
                continue

            if line.startswith(("- ", "* ")):
                flush_paragraph()

                story.append(
                    Paragraph(
                        self._inline_markdown(line[2:]),
                        styles["Bullet"],
                        bulletText="-",
                    )
                )
                continue

            paragraph_lines.append(line)

        flush_paragraph()

        if not story:
            story.append(
                Paragraph(
                    "No report content was generated.",
                    styles["Body"],
                )
            )

        return story

    @staticmethod
    def _inline_markdown(value: str) -> str:
        escaped_value = escape(value)

        while "**" in escaped_value:
            escaped_value = escaped_value.replace(
                "**",
                "<b>",
                1,
            )

            if "**" not in escaped_value:
                escaped_value = escaped_value.replace(
                    "<b>",
                    "**",
                    1,
                )
                break

            escaped_value = escaped_value.replace(
                "**",
                "</b>",
                1,
            )

        return escaped_value

    @staticmethod
    def _draw_page_footer(
        canvas: Canvas,
        document: SimpleDocTemplate,
    ) -> None:
        canvas.saveState()

        page_width, _ = A4

        generated_at = datetime.now(
            timezone.utc
        ).strftime("%Y-%m-%d")

        footer = (
            f"TubeIntel Analysis Report Â· "
            f"Generated {generated_at} Â· "
            f"Page {document.page}"
        )

        canvas.setFont("Helvetica", 8)
        canvas.setFillColor(colors.HexColor("#6B7280"))

        canvas.drawCentredString(
            page_width / 2,
            10 * mm,
            footer,
        )

        canvas.restoreState()
