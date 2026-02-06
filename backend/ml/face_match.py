import cv2
import numpy as np
try:
    from insightface import app as face_app
    from insightface.utils import face_align
    INSIGHTFACE_AVAILABLE = True
except ImportError:
    INSIGHTFACE_AVAILABLE = False

face_model = None

def init_face_model():
    """Initialize face recognition model"""
    global face_model
    if INSIGHTFACE_AVAILABLE and face_model is None:
        try:
            # Initialize InsightFace model
            # Note: You need to download the model files
            # face_model = face_app.FaceAnalysis(providers=['CPUExecutionProvider'])
            # face_model.prepare(ctx_id=0, det_size=(640, 640))
            pass
        except Exception as e:
            print(f"Face model initialization error: {e}")

def extract_face_embedding(image_path):
    """
    Extract face embedding from image
    Returns 512-dimensional embedding vector or None
    """
    if not INSIGHTFACE_AVAILABLE:
        return None
    
    init_face_model()
    
    if face_model is None:
        return None
    
    img = cv2.imread(image_path)
    if img is None:
        return None
    
    try:
        faces = face_model.get(img)
        if faces and len(faces) > 0:
            # Return embedding of first detected face
            return faces[0].embedding.tolist()
    except Exception as e:
        print(f"Face embedding extraction error: {e}")
    
    return None

def cosine_similarity(embedding1, embedding2):
    """Calculate cosine similarity between two embeddings"""
    if embedding1 is None or embedding2 is None:
        return 0.0
    
    vec1 = np.array(embedding1)
    vec2 = np.array(embedding2)
    
    dot_product = np.dot(vec1, vec2)
    norm1 = np.linalg.norm(vec1)
    norm2 = np.linalg.norm(vec2)
    
    if norm1 == 0 or norm2 == 0:
        return 0.0
    
    return float(dot_product / (norm1 * norm2))

def match_faces(embedding1, embedding2, threshold=0.7):
    """
    Match two face embeddings
    Returns (is_match, similarity_score)
    """
    similarity = cosine_similarity(embedding1, embedding2)
    return similarity >= threshold, similarity

