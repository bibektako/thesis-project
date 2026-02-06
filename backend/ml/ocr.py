import cv2
import numpy as np
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    try:
        from paddleocr import PaddleOCR
        PADDLE_AVAILABLE = True
    except ImportError:
        PADDLE_AVAILABLE = False

def preprocess_image(image_path):
    """Preprocess image for better OCR results"""
    img = cv2.imread(image_path)
    if img is None:
        return None
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Apply thresholding
    _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # Denoise
    denoised = cv2.fastNlMeansDenoising(thresh, None, 10, 7, 21)
    
    return denoised

def extract_text_tesseract(image_path):
    """Extract text using Tesseract OCR"""
    if not TESSERACT_AVAILABLE:
        return ""
    
    processed_img = preprocess_image(image_path)
    if processed_img is None:
        return ""
    
    try:
        text = pytesseract.image_to_string(processed_img, lang='eng')
        return text.strip()
    except Exception as e:
        print(f"Tesseract OCR error: {e}")
        return ""

def extract_text_paddle(image_path):
    """Extract text using PaddleOCR"""
    if not PADDLE_AVAILABLE:
        return ""
    
    try:
        ocr = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=False)
        result = ocr.ocr(image_path, cls=True)
        
        if not result or not result[0]:
            return ""
        
        texts = []
        for line in result[0]:
            if line and len(line) > 1:
                texts.append(line[1][0])
        
        return " ".join(texts)
    except Exception as e:
        print(f"PaddleOCR error: {e}")
        return ""

def extract_text(image_path):
    """
    Extract text from image using available OCR engine
    Returns extracted text string
    """
    if TESSERACT_AVAILABLE:
        return extract_text_tesseract(image_path)
    elif PADDLE_AVAILABLE:
        return extract_text_paddle(image_path)
    else:
        # Fallback: return empty string
        print("Warning: No OCR engine available. Install pytesseract or paddleocr")
        return ""

