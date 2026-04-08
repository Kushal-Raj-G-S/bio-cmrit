from __future__ import annotations

from pathlib import Path

from pypdf import PdfReader


def extract_pages(pdf_path: str) -> list[str]:
    """Extract text page-by-page from a PDF using pypdf."""
    reader = PdfReader(pdf_path)
    pages: list[str] = []
    for page in reader.pages:
        text = (page.extract_text() or "").strip()
        if text:
            pages.append(text)
    return pages


def list_pdf_files(folder: str) -> list[Path]:
    base = Path(folder)
    return sorted(p for p in base.rglob("*.pdf") if p.is_file())
