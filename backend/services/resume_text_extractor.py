from pathlib import Path

from pypdf import PdfReader
from docx import Document


# ==========================================
# EXTRACT PDF TEXT
# ==========================================

def extract_pdf_text(
    file_path: str,
) -> str:

    try:

        reader = PdfReader(file_path)

        text_parts = []

        for page in reader.pages:

            page_text = page.extract_text()

            if page_text:

                text_parts.append(
                    page_text
                )

        return "\n".join(text_parts)

    except Exception as error:

        print(
            f"PDF extraction error: {error}"
        )

        return ""


# ==========================================
# EXTRACT DOCX TEXT
# ==========================================

def extract_docx_text(
    file_path: str,
) -> str:

    try:

        document = Document(file_path)

        paragraphs = []

        for paragraph in document.paragraphs:

            if paragraph.text.strip():

                paragraphs.append(
                    paragraph.text
                )

        return "\n".join(paragraphs)

    except Exception as error:

        print(
            f"DOCX extraction error: {error}"
        )

        return ""


# ==========================================
# MAIN TEXT EXTRACTION FUNCTION
# ==========================================

def extract_resume_text(
    file_path: str,
) -> str:

    path = Path(file_path)

    extension = path.suffix.lower()

    if extension == ".pdf":

        return extract_pdf_text(
            str(path)
        )

    if extension == ".docx":

        return extract_docx_text(
            str(path)
        )

    return ""