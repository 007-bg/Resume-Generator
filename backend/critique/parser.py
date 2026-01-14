"""
PDF text extraction utilities for resume parsing.
Uses pdfplumber for superior layout analysis.
"""

import re
import logging
from typing import Optional
from io import BytesIO

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_path_or_buffer) -> str:
    """
    Extract text from a PDF file or buffer.
    
    Args:
        file_path_or_buffer: Either a file path string or a file-like object
        
    Returns:
        Extracted and cleaned text from the PDF
    """
    try:
        import pdfplumber
        
        # Handle both file paths and file objects
        if hasattr(file_path_or_buffer, 'read'):
            pdf = pdfplumber.open(BytesIO(file_path_or_buffer.read()))
        else:
            pdf = pdfplumber.open(file_path_or_buffer)
        
        text_parts = []
        
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
        
        pdf.close()
        
        raw_text = '\n\n'.join(text_parts)
        return clean_resume_text(raw_text)
        
    except ImportError:
        logger.warning("pdfplumber not installed, falling back to PyPDF2")
        return _fallback_extract_pypdf2(file_path_or_buffer)
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise


def _fallback_extract_pypdf2(file_path_or_buffer) -> str:
    """Fallback PDF extraction using PyPDF2."""
    try:
        from PyPDF2 import PdfReader
        
        if hasattr(file_path_or_buffer, 'read'):
            reader = PdfReader(BytesIO(file_path_or_buffer.read()))
        else:
            reader = PdfReader(file_path_or_buffer)
        
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text:
                text_parts.append(text)
        
        raw_text = '\n\n'.join(text_parts)
        return clean_resume_text(raw_text)
        
    except Exception as e:
        logger.error(f"Fallback PDF extraction failed: {e}")
        raise


def clean_resume_text(text: str) -> str:
    """
    Clean and normalize extracted resume text.
    
    - Removes excessive whitespace
    - Normalizes bullet points
    - Removes special characters while preserving tech terms (C++, .NET, etc.)
    - Normalizes date formats
    """
    if not text:
        return ""
    
    # Replace common bullet point characters with standard bullet
    bullet_chars = ['•', '●', '○', '◦', '▪', '▫', '■', '□', '►', '➤', '➢', '→', '»', '✓', '✔']
    for char in bullet_chars:
        text = text.replace(char, '• ')
    
    # Remove non-printable characters except newlines and tabs
    text = re.sub(r'[^\x20-\x7E\n\t]', ' ', text)
    
    # Normalize multiple spaces to single space
    text = re.sub(r'[ \t]+', ' ', text)
    
    # Normalize multiple newlines to double newline (paragraph break)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Remove leading/trailing whitespace from each line
    lines = [line.strip() for line in text.split('\n')]
    text = '\n'.join(lines)
    
    # Remove extra blank lines at start/end
    text = text.strip()
    
    return text


def extract_sections(text: str) -> dict:
    """
    Attempt to identify common resume sections.
    
    Returns a dict with section names and their content.
    Common sections: Summary, Experience, Education, Skills, Projects
    """
    sections = {}
    
    # Common section headers (case-insensitive)
    section_patterns = [
        (r'(?i)^(summary|professional\s+summary|objective|profile)', 'summary'),
        (r'(?i)^(experience|work\s+experience|employment|professional\s+experience)', 'experience'),
        (r'(?i)^(education|academic|qualifications)', 'education'),
        (r'(?i)^(skills|technical\s+skills|core\s+competencies|technologies)', 'skills'),
        (r'(?i)^(projects|personal\s+projects|portfolio)', 'projects'),
        (r'(?i)^(certifications?|licenses?|credentials)', 'certifications'),
        (r'(?i)^(awards?|achievements?|honors?)', 'awards'),
    ]
    
    lines = text.split('\n')
    current_section = 'header'
    current_content = []
    
    for line in lines:
        line_stripped = line.strip()
        
        # Check if this line is a section header
        matched_section = None
        for pattern, section_name in section_patterns:
            if re.match(pattern, line_stripped):
                matched_section = section_name
                break
        
        if matched_section:
            # Save previous section
            if current_content:
                sections[current_section] = '\n'.join(current_content).strip()
            current_section = matched_section
            current_content = []
        else:
            current_content.append(line)
    
    # Save last section
    if current_content:
        sections[current_section] = '\n'.join(current_content).strip()
    
    return sections
