from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="OCR Correction API")

class CorrectionRequest(BaseModel):
    text: str
    context: Optional[str] = None

@app.get("/healthz")
async def health_check(health_check_token: str = Header(None)):
    if health_check_token != os.getenv("HEALTH_CHECK_TOKEN"):
        raise HTTPException(status_code=401, detail="Invalid health check token")
    return {"status": "healthy"}

@app.post("/api/correct")
async def correct_text(request: CorrectionRequest):
    try:
        # Votre logique de correction ici
        return {"corrected_text": request.text, "status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 