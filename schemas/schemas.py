from pydantic import BaseModel, Field
from typing import List, Dict, Optional

class ProcessedDocument(BaseModel):
    """Document traité par l'OCR"""
    file_id: str
    text_content: str
    metadata: Optional[Dict] = None

class CorrectionRequest(BaseModel):
    """Requête de correction d'une copie"""
    class_level: str = Field(..., description="Niveau de la classe (ex: Terminale S)")
    student_copy_text: str = Field(..., description="Texte de la copie de l'étudiant")
    exam_subject_text: str = Field(..., description="Texte du sujet d'examen")
    perfect_answer_text: str = Field(..., description="Texte de la correction type")
    grading_criteria: Optional[Dict] = Field(default=None, description="Critères de notation spécifiques")

class CorrectionResponse(BaseModel):
    """Réponse de correction avec note et commentaires"""
    grade: float = Field(..., description="Note attribuée")
    max_grade: float = Field(default=20.0, description="Note maximale possible")
    comments: List[str] = Field(default_factory=list, description="Commentaires sur la copie")
    detailed_feedback: Dict = Field(default_factory=dict, description="Retour détaillé par critère")
    
class CorrectionBatch(BaseModel):
    """Lot de copies à corriger"""
    class_level: str
    exam_subject_id: str
    perfect_answer_id: str
    student_copies: List[str]
 