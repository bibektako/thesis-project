from rapidfuzz import fuzz

def token_set_ratio(text1, text2):
    """
    Calculate token set ratio between two texts
    Returns score between 0-100
    """
    return fuzz.token_set_ratio(text1.lower(), text2.lower())

def is_ocr_match(extracted_text, expected_text, threshold=70.0):
    """
    Check if extracted text matches expected text
    Returns (is_match, score)
    """
    score = token_set_ratio(extracted_text, expected_text)
    return score >= threshold, score





