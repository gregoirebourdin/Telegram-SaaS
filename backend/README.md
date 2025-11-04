# Backend Telegram Activity Monitor

Backend FastAPI avec intégration Telethon pour monitorer l'activité Telegram.

## Technologies

- **FastAPI**: Framework web moderne et rapide
- **Telethon**: Client Telegram pour Python
- **Uvicorn**: Serveur ASGI haute performance

## Installation Locale

\`\`\`bash
# Installer les dépendances
pip install -r requirements.txt

# Configurer les variables d'environnement
cp .env.example .env
# Éditer .env avec vos identifiants

# Lancer le serveur
uvicorn main:app --reload
\`\`\`

Le serveur sera disponible sur `http://localhost:8000`

## API Endpoints

### Authentification

- `POST /api/send-code` - Envoyer le code de vérification
- `POST /api/sign-in` - Se connecter avec le code
- `POST /api/sign-in-password` - Se connecter avec mot de passe 2FA
- `POST /api/logout` - Se déconnecter

### Données

- `GET /api/stats` - Statistiques du compte
- `GET /api/activities` - Liste des activités récentes
- `GET /api/activity-chart` - Données pour le graphique d'activité

## Déploiement

Voir [DEPLOYMENT.md](./DEPLOYMENT.md) pour les instructions complètes de déploiement sur Railway.

## Structure

\`\`\`
backend/
├── main.py              # Application FastAPI principale
├── requirements.txt     # Dépendances Python
├── Dockerfile          # Configuration Docker
├── railway.yaml        # Configuration Railway
└── .env.example        # Template variables d'environnement
\`\`\`

## Sécurité

- Les sessions sont stockées en mémoire (utilisez Redis en production)
- Configurez CORS avec votre domaine frontend en production
- Ne commitez jamais vos identifiants API
