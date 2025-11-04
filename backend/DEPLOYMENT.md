# Guide de Déploiement Railway - Backend Telegram

Ce guide vous explique comment déployer le backend Python sur Railway et obtenir votre `BACKEND_URL`.

## Étape 1: Créer un compte Railway

1. Allez sur [railway.app](https://railway.app)
2. Créez un compte (gratuit pour commencer)
3. Connectez votre compte GitHub

## Étape 2: Obtenir vos identifiants Telegram API

1. Allez sur [my.telegram.org](https://my.telegram.org)
2. Connectez-vous avec votre numéro de téléphone
3. Cliquez sur "API development tools"
4. Créez une nouvelle application
5. Notez votre `api_id` et `api_hash`

## Étape 3: Déployer sur Railway

### Option A: Depuis GitHub (Recommandé)

1. Poussez votre code sur GitHub
2. Dans Railway, cliquez sur "New Project"
3. Sélectionnez "Deploy from GitHub repo"
4. Choisissez votre repository
5. Railway détectera automatiquement le Dockerfile

### Option B: Depuis CLI Railway

\`\`\`bash
# Installer Railway CLI
npm install -g @railway/cli

# Se connecter
railway login

# Depuis le dossier backend/
cd backend
railway init
railway up
\`\`\`

## Étape 4: Configurer les Variables d'Environnement

Dans le dashboard Railway de votre projet:

1. Allez dans l'onglet "Variables"
2. Ajoutez les variables suivantes:

\`\`\`
TELEGRAM_API_ID=votre_api_id
TELEGRAM_API_HASH=votre_api_hash
PORT=8000
\`\`\`

## Étape 5: Obtenir votre BACKEND_URL

Une fois le déploiement terminé:

1. Dans Railway, allez dans l'onglet "Settings"
2. Cliquez sur "Generate Domain" sous "Networking"
3. Railway va générer une URL publique comme: `https://votre-projet.up.railway.app`
4. **C'est votre BACKEND_URL!**

Exemple: `https://telegram-monitor-production.up.railway.app`

## Étape 6: Configurer le Frontend

Dans votre projet Next.js, ajoutez la variable d'environnement:

\`\`\`env
NEXT_PUBLIC_BACKEND_URL=https://votre-projet.up.railway.app
\`\`\`

Ou dans les Variables Vercel si vous déployez sur Vercel.

## Vérification

Pour vérifier que votre backend fonctionne:

1. Visitez `https://votre-projet.up.railway.app/` dans votre navigateur
2. Vous devriez voir: `{"status":"ok","message":"Telegram Activity Monitor API"}`

## Logs et Debugging

Pour voir les logs de votre application:

\`\`\`bash
railway logs
\`\`\`

Ou dans le dashboard Railway, onglet "Deployments" > "View Logs"

## Coûts

Railway offre:
- 500 heures gratuites par mois
- 5$ de crédit gratuit
- Parfait pour commencer et tester

## Support

Si vous rencontrez des problèmes:
- Vérifiez les logs Railway
- Assurez-vous que les variables d'environnement sont correctement configurées
- Vérifiez que votre `api_id` et `api_hash` sont valides
