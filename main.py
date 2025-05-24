from fastapi import FastAPI, HTTPException, File, UploadFile, Form, Request, Depends, Header
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

from services.ocr_service import process_document
from services.correction_service import process_correction
from schemas.schemas import CorrectionRequest, CorrectionResponse, ProcessedDocument, CorrectionBatch
from config.config import get_settings, Settings

# Chargement des variables d'environnement
load_dotenv()
settings = get_settings()

# Configuration du logger
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="OpenCorrection API",
    version=settings.API_VERSION,
    debug=settings.DEBUG
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    duration = datetime.now() - start_time
    logger.info(
        f"Path: {request.url.path} - Method: {request.method} - "
        f"Status: {response.status_code} - Duration: {duration.total_seconds()}s"
    )
    return response

@app.get("/healthz")
async def health_check(
    settings: Settings = Depends(get_settings),
    x_health_check_token: str = Header(None)
):
    if x_health_check_token != settings.HEALTH_CHECK_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid health check token")
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {"message": "Bienvenue sur l'API OpenCorrection"}

@app.post("/upload/document", response_model=ProcessedDocument)
async def upload_document(
    file: UploadFile = File(...),
    doc_type: str = Form(...)  # 'student_copy', 'exam_subject', ou 'perfect_answer'
):
    """Upload et traitement OCR d'un document"""
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Seuls les fichiers PDF sont acceptés")
    
    # Traitement OCR
    ocr_result = await process_document(file)
    
    return ProcessedDocument(
        file_id=ocr_result["file_id"],
        text_content=ocr_result["text"],
        metadata=ocr_result.get("metadata")
    )

@app.post("/correction/batch", response_model=CorrectionResponse)
async def create_batch_correction(batch_data: CorrectionBatch):
    """Création d'un lot de corrections"""
    try:
        # Pour l'instant, on ne traite qu'une seule copie
        correction_request = CorrectionRequest(
            class_level=batch_data.class_level,
            student_copy_text=batch_data.student_copies[0],
            exam_subject_text=batch_data.exam_subject_id,
            grading_criteria=batch_data.grading_criteria,
            perfect_answer_text=batch_data.perfect_answer_id
        )
        
        return await process_correction(correction_request)
        
    except Exception as e:
        logger.error(f"Error during batch correction: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 