# Déployer le Backend Python sur Railway

## Problème Actuel

Si vous voyez l'erreur "BACKEND_URL is pointing to a Next.js app", c'est parce que Railway a déployé le frontend Next.js au lieu du backend Python.

## Solution: Déployer UNIQUEMENT le dossier backend/

### Option 1: Via GitHub (Recommandé)

1. **Créer un nouveau dépôt Git pour le backend uniquement**
   \`\`\`bash
   cd backend
   git init
   git add .
   git commit -m "Initial backend commit"
   \`\`\`

2. **Créer un nouveau repo sur GitHub** (ex: `telegram-backend`)

3. **Pousser le code**
   \`\`\`bash
   git remote add origin https://github.com/VOTRE_USERNAME/telegram-backend.git
   git push -u origin main
   \`\`\`

4. **Déployer sur Railway**
   - Allez sur [railway.app](https://railway.app)
   - Cliquez sur "New Project"
   - Sélectionnez "Deploy from GitHub repo"
   - Choisissez votre repo `telegram-backend`
   - Railway détectera automatiquement Python

5. **Configurer les variables d'environnement**
   - Dans Railway, allez dans votre projet > Variables
   - Ajoutez:
     - `TELEGRAM_API_ID` = votre API ID de my.telegram.org
     - `TELEGRAM_API_HASH` = votre API Hash de my.telegram.org
     - `PORT` = 8080

6. **Obtenir l'URL du backend**
   - Dans Railway, allez dans Settings > Networking
   - Cliquez sur "Generate Domain"
   - Copiez l'URL (ex: `https://telegram-backend-production.up.railway.app`)

7. **Mettre à jour BACKEND_URL dans v0**
   - Dans v0, allez dans la sidebar > Vars
   - Mettez à jour `BACKEND_URL` avec l'URL Railway (SANS le port, Railway gère ça automatiquement)
   - Exemple: `https://telegram-backend-production.up.railway.app`

### Option 2: Via Railway CLI

1. **Installer Railway CLI**
   \`\`\`bash
   npm i -g @railway/cli
   \`\`\`

2. **Se connecter**
   \`\`\`bash
   railway login
   \`\`\`

3. **Déployer depuis le dossier backend**
   \`\`\`bash
   cd backend
   railway init
   railway up
   \`\`\`

4. **Configurer les variables** (voir étape 5 de l'Option 1)

5. **Générer le domaine** (voir étape 6 de l'Option 1)

## Vérifier que ça fonctionne

Une fois déployé, testez votre backend:

\`\`\`bash
curl https://VOTRE_URL_RAILWAY.up.railway.app/health
\`\`\`

Vous devriez voir:
\`\`\`json
{"status": "healthy", "service": "Telegram SaaS Backend"}
\`\`\`

Si vous voyez du HTML ou une page Vercel, c'est que Railway déploie encore le mauvais projet.

## Dépannage

### Railway déploie toujours Next.js
- Assurez-vous de déployer UNIQUEMENT le dossier `backend/`, pas le repo entier
- Vérifiez que `requirements.txt` et `main.py` sont à la racine du projet Railway

### Erreur "Module not found"
- Vérifiez que `requirements.txt` contient toutes les dépendances
- Railway devrait installer automatiquement avec `pip install -r requirements.txt`

### Le backend ne démarre pas
- Vérifiez les logs dans Railway Dashboard
- Assurez-vous que les variables d'environnement sont bien configurées
- Le port doit être 8080 ou utiliser la variable `PORT` de Railway
