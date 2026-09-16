from io import BytesIO

from docx import Document
from reportlab.lib.pagesizes import A4 # type: ignore
from reportlab.lib.styles import getSampleStyleSheet # type: ignore
from reportlab.lib.units import mm # type: ignore
from reportlab.platypus import ( # type: ignore
    SimpleDocTemplate,
    Paragraph,
    Spacer,
)
from reportlab.lib.enums import TA_LEFT # type: ignore


def create_cover_letter_pdf(
    content: str,
) -> BytesIO:

    output = BytesIO()

    document = SimpleDocTemplate(
        output,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
    )

    styles = getSampleStyleSheet()

    style = styles["Normal"]
    style.alignment = TA_LEFT
    style.fontSize = 11
    style.leading = 18

    story = []

    paragraphs = content.split("\n\n")

    for paragraph in paragraphs:

        paragraph = paragraph.strip()

        if not paragraph:
            continue

        paragraph = paragraph.replace(
            "&",
            "&amp;",
        )

        story.append(
            Paragraph(
                paragraph,
                style,
            )
        )

        story.append(
            Spacer(
                1,
                8,
            )
        )

    document.build(story)

    output.seek(0)

    return output


def create_cover_letter_docx(
    content: str,
) -> BytesIO:

    output = BytesIO()

    document = Document()

    paragraphs = content.split("\n\n")

    for paragraph in paragraphs:

        paragraph = paragraph.strip()

        if not paragraph:
            continue

        document.add_paragraph(
            paragraph
        )

    document.save(output)

    output.seek(0)

    return output