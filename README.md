# OpenCorrection API

API de correction automatique de copies d'étudiants utilisant FastAPI et Mistral AI.

## Fonctionnalités

- Upload de documents PDF (copies d'étudiants, sujets, corrigés)
- OCR via Mistral AI
- Analyse et notation automatique
- Génération de rapports détaillés

## Installation

1. Cloner le repository :
```bash
git clone https://github.com/ledesseinduneideecontact/OCR-correction.git
cd OCR-correction
```

2. Créer un environnement virtuel et l'activer :
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
```

3. Installer les dépendances :
```bash
pip install -r requirements.txt
```

4. Configurer les variables d'environnement dans un fichier `.env` :
```
SECRET_KEY=votre_clé_secrète
MISTRAL_API_KEY=votre_clé_api_mistral
HEALTH_CHECK_TOKEN=votre_token_health_check
ENVIRONMENT=development
DEBUG=true
```

## Utilisation

1. Démarrer le serveur :
```bash
uvicorn main:app --reload
```

2. Accéder à la documentation de l'API :
- Swagger UI : http://localhost:8000/docs
- ReDoc : http://localhost:8000/redoc

## Structure du Projet

```
OCR-correction/
├── main.py              # Point d'entrée de l'application
├── requirements.txt     # Dépendances Python
├── render.yaml         # Configuration pour le déploiement
├── config/            # Configuration de l'application
├── services/          # Services métier (OCR, correction)
└── schemas/           # Modèles Pydantic
```

## Déploiement

Le projet est configuré pour être déployé sur Render.com. Le fichier `render.yaml` contient toute la configuration nécessaire.

## Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

## Licence

MIT License 