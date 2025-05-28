from fastapi import FastAPI, HTTPException, Depends, Header
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
import logging

# Configuration du logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Chargement des variables d'environnement
load_dotenv()

# Initialisation de l'API
app = FastAPI(
    title="OCR Correction API",
    description="API pour la correction de textes OCR avec Mistral AI",
    version="1.0.0"
)

# Initialisation du client Mistral AI
mistral_client = MistralClient(api_key=os.getenv("MISTRAL_API_KEY"))

class CorrectionRequest(BaseModel):
    text: str
    context: Optional[str] = None
    language: Optional[str] = "french"

class CorrectionResponse(BaseModel):
    corrected_text: str
    status: str
    confidence: float

def get_correction_prompt(text: str, context: Optional[str], language: str) -> str:
    base_prompt = f"""En tant que correcteur professionnel, votre tâche est de corriger le texte suivant en {language}.
    Corrigez les erreurs d'OCR, la grammaire, l'orthographe et la ponctuation.
    
    Texte original : {text}
    """
    
    if context:
        base_prompt += f"\nContexte : {context}"
        
    base_prompt += "\nTexte corrigé :"
    return base_prompt

@app.get("/healthz")
async def health_check(health_check_token: str = Header(None)):
    """
    Endpoint de contrôle de santé pour Render
    """
    if health_check_token != os.getenv("HEALTH_CHECK_TOKEN"):
        raise HTTPException(status_code=401, detail="Invalid health check token")
    return {"status": "healthy"}

@app.post("/api/correct", response_model=CorrectionResponse)
async def correct_text(request: CorrectionRequest):
    """
    Endpoint pour corriger le texte avec Mistral AI
    """
    try:
        logger.info(f"Réception d'une demande de correction pour {len(request.text)} caractères")
        
        # Création du prompt
        prompt = get_correction_prompt(request.text, request.context, request.language)
        
        # Appel à Mistral AI
        messages = [
            ChatMessage(role="user", content=prompt)
        ]
        
        chat_response = mistral_client.chat(
            model="mistral-medium",
            messages=messages,
            temperature=0.3,
            max_tokens=1000
        )
        
        corrected_text = chat_response.messages[0].content
        
        logger.info("Correction effectuée avec succès")
        
        return CorrectionResponse(
            corrected_text=corrected_text,
            status="success",
            confidence=0.95  # À ajuster selon les métriques réelles
        )
        
    except Exception as e:
        logger.error(f"Erreur lors de la correction : {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur lors de la correction : {str(e)}"
        ) 