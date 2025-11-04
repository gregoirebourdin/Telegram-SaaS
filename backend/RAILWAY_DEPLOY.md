# Déploiement Railway - Guide de dépannage

## Erreur de build Docker

Si vous rencontrez l'erreur:
\`\`\`
ERROR: failed to build: listing workers for Build: failed to list workers: Unavailable: connection error
\`\`\`

### Solutions:

1. **Redéployer le projet**
   - Allez dans votre projet Railway
   - Cliquez sur "Deploy" → "Redeploy"
   - Cette erreur est souvent temporaire et liée à l'infrastructure Railway

2. **Vérifier les variables d'environnement**
   - `TELEGRAM_API_ID` doit être défini
   - `TELEGRAM_API_HASH` doit être défini
   - `PORT` est automatiquement défini par Railway (8080 par défaut)

3. **Vérifier les logs**
   - Allez dans l'onglet "Deployments"
   - Cliquez sur le dernier déploiement
   - Vérifiez les logs de build et de runtime

4. **Alternative: Déploiement sans Dockerfile**
   Si le problème persiste, vous pouvez déployer sans Dockerfile:
   
   a. Supprimez ou renommez `railway.yaml`
   
   b. Railway détectera automatiquement Python et utilisera:
   \`\`\`
   pip install -r requirements.txt
   uvicorn main:app --host 0.0.0.0 --port $PORT
   \`\`\`

5. **Tester localement**
   \`\`\`bash
   cd backend
   pip install -r requirements.txt
   export TELEGRAM_API_ID="votre_api_id"
   export TELEGRAM_API_HASH="votre_api_hash"
   python main.py
   \`\`\`

## Vérification du déploiement

Une fois déployé, testez le endpoint de santé:
\`\`\`bash
curl https://votre-app.up.railway.app/health
\`\`\`

Vous devriez recevoir:
\`\`\`json
{
  "status": "healthy",
  "api_configured": true,
  "active_sessions": 0
}
\`\`\`

## Configuration Railway recommandée

### Variables d'environnement requises:
- `TELEGRAM_API_ID` - Votre API ID de my.telegram.org
- `TELEGRAM_API_HASH` - Votre API Hash de my.telegram.org

### Variables automatiques (ne pas définir):
- `PORT` - Défini automatiquement par Railway
- `RAILWAY_ENVIRONMENT` - Défini par Railway

## Support

Si le problème persiste après plusieurs tentatives:
1. Vérifiez le status de Railway: https://railway.app/status
2. Contactez le support Railway
3. Essayez de déployer à un moment différent (l'erreur est souvent temporaire)
