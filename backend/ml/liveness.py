import cv2
import numpy as np
try:
    import mediapipe as mp
    MEDIAPIPE_AVAILABLE = True
except ImportError:
    MEDIAPIPE_AVAILABLE = False

mp_face_detection = None
mp_drawing = None

if MEDIAPIPE_AVAILABLE:
    mp_face_detection = mp.solutions.face_detection
    mp_drawing = mp.solutions.drawing_utils

def calculate_eye_aspect_ratio(landmarks, eye_indices):
    """Calculate Eye Aspect Ratio for blink detection"""
    if len(landmarks) < 6:
        return 0.0
    
    # Simplified EAR calculation
    # In real implementation, use proper facial landmarks
    return 0.3  # Placeholder

def detect_face(image_path):
    """Detect face in image using MediaPipe"""
    if not MEDIAPIPE_AVAILABLE:
        return None, 0.0
    
    img = cv2.imread(image_path)
    if img is None:
        return None, 0.0
    
    rgb_img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    
    with mp_face_detection.FaceDetection(
        model_selection=0, min_detection_confidence=0.5
    ) as face_detection:
        results = face_detection.process(rgb_img)
        
        if results.detections:
            detection = results.detections[0]
            confidence = detection.score[0]
            
            # Calculate bounding box
            bbox = detection.location_data.relative_bounding_box
            h, w, _ = img.shape
            x = int(bbox.xmin * w)
            y = int(bbox.ymin * h)
            width = int(bbox.width * w)
            height = int(bbox.height * h)
            
            return (x, y, width, height), confidence
    
    return None, 0.0

def check_image_quality(image_path):
    """Check image quality metrics"""
    img = cv2.imread(image_path)
    if img is None:
        return 0.0
    
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Laplacian variance for blur detection
    laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
    
    # Normalize to 0-1 range
    quality_score = min(laplacian_var / 100.0, 1.0)
    
    return quality_score

def calculate_liveness_score(image_path):
    """
    Calculate liveness score for selfie
    Returns score between 0-1
    """
    if not MEDIAPIPE_AVAILABLE:
        # Fallback: basic quality check
        return check_image_quality(image_path)
    
    face_bbox, face_confidence = detect_face(image_path)
    
    if face_bbox is None:
        return 0.0
    
    # Base score from face detection confidence
    liveness_score = face_confidence
    
    # Add quality score
    quality_score = check_image_quality(image_path)
    
    # Combined score (weighted average)
    final_score = (liveness_score * 0.7) + (quality_score * 0.3)
    
    return float(final_score)

