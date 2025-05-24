from mistralai.client import MistralClient
from mistralai.models.chat_completion import ChatMessage
from config.config import get_settings
from schemas.schemas import CorrectionRequest, CorrectionResponse

settings = get_settings()
mistral_client = MistralClient(api_key=settings.MISTRAL_API_KEY)

async def process_correction(request: CorrectionRequest) -> CorrectionResponse:
    """Traite une demande de correction avec Mistral AI"""
    
    # Construction du prompt pour l'analyse
    system_prompt = """Tu es un professeur expert en correction de copies. 
    Analyse la copie de l'étudiant en la comparant au sujet et à la correction type.
    Attribue une note sur 20 et fournis des commentaires détaillés."""
    
    user_prompt = f"""
    Niveau: {request.class_level}
    
    Sujet:
    {request.exam_subject_text}
    
    Correction type:
    {request.perfect_answer_text}
    
    Copie de l'étudiant:
    {request.student_copy_text}
    
    Critères de notation:
    {request.grading_criteria if request.grading_criteria else 'Notation standard sur 20 points'}
    """
    
    messages = [
        ChatMessage(role="system", content=system_prompt),
        ChatMessage(role="user", content=user_prompt)
    ]
    
    # Analyse avec Mistral
    chat_response = mistral_client.chat(
        model="mistral-large-latest",
        messages=messages
    )
    
    # Traitement de la réponse
    analysis = chat_response.choices[0].message.content
    
    # TODO: Implémenter un parsing plus robuste de la réponse
    # Pour l'instant, on suppose une structure simple
    try:
        # Format attendu : "Note: X/20\nCommentaires:\n- ..."
        parts = analysis.split("\n")
        grade = float(parts[0].split(":")[1].strip().split("/")[0])
        comments = [line.strip("- ") for line in parts[2:] if line.strip()]
        
        return CorrectionResponse(
            grade=grade,
            max_grade=20.0,
            comments=comments,
            detailed_feedback={"analysis": analysis}
        )
        
    except Exception as e:
        # En cas d'erreur de parsing, on retourne une réponse par défaut
        return CorrectionResponse(
            grade=10.0,
            comments=["Erreur dans l'analyse automatique. Merci de vérifier manuellement."],
            detailed_feedback={"error": str(e), "raw_analysis": analysis}
        ) 