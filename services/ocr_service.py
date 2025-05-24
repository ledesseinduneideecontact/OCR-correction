import os
import uuid
from fastapi import UploadFile
from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from config.config import get_settings

settings = get_settings()
mistral_client = MistralClient(api_key=settings.MISTRAL_API_KEY)

async def process_document(file: UploadFile) -> dict:
    """Traite un document PDF avec OCR via Mistral AI"""
    
    # Lecture du fichier
    content = await file.read()
    temp_path = f"/tmp/{str(uuid.uuid4())}.pdf"
    
    try:
        # Sauvegarde temporaire du fichier
        with open(temp_path, "wb") as f:
            f.write(content)
            
        # Extraction du texte avec Mistral
        messages = [
            ChatMessage(role="system", content="Tu es un expert en OCR. Extrais le texte de ce document PDF."),
            ChatMessage(role="user", content=f"Voici le contenu du fichier {file.filename}. Extrais tout le texte.")
        ]
        
        chat_response = mistral_client.chat(
            model="mistral-large-latest",
            messages=messages
        )
        
        extracted_text = chat_response.choices[0].message.content
        
        return {
            "file_id": str(uuid.uuid4()),
            "text": extracted_text,
            "metadata": {
                "filename": file.filename,
                "size": len(content),
                "content_type": file.content_type
            }
        }
        
    finally:
        # Nettoyage
        if os.path.exists(temp_path):
            os.remove(temp_path) 