# Troubleshooting Guide

## Common Issues

### Error: "Backend is not responding correctly"

This error occurs when the frontend cannot connect to the Python backend or receives an HTML response instead of JSON.

**Possible causes:**

1. **Backend not deployed**: Make sure your Python backend is deployed on Railway
2. **Wrong BACKEND_URL**: Check that the `BACKEND_URL` environment variable points to your Railway backend
3. **Backend crashed**: Check Railway logs for Python errors

**How to fix:**

1. Check your Railway deployment:
   - Go to your Railway project
   - Make sure the backend service is running (green status)
   - Check the logs for any errors

2. Verify your BACKEND_URL:
   - In v0, check the "Vars" section in the sidebar
   - The URL should look like: `https://your-app.up.railway.app`
   - Make sure it does NOT end with a slash
   - Make sure it's the Railway app URL, not a custom domain

3. Test the backend directly:
   - Open `https://your-backend-url.up.railway.app/health` in your browser
   - You should see: `{"status":"healthy","api_configured":true,"active_sessions":0}`
   - If you see an error or HTML page, your backend is not running correctly

4. Check Railway environment variables:
   - Make sure `TELEGRAM_API_ID` is set (should be a number)
   - Make sure `TELEGRAM_API_HASH` is set (should be a string)
   - Get these from https://my.telegram.org

### Error: "Only StringSession and StoreSessions are supported"

This error was from an old version that used GramJS. It should be fixed now.

### Backend deployment fails

If Railway deployment fails:

1. Check the Railway logs for specific errors
2. Make sure `requirements.txt` is in the `backend/` folder
3. Make sure `TELEGRAM_API_ID` and `TELEGRAM_API_HASH` are set in Railway
4. Try redeploying

### Phone code not received

1. Make sure your phone number includes the country code (e.g., +1 for US)
2. Check your Telegram app for the code
3. The code expires after a few minutes - request a new one if needed

## Getting Help

If you're still having issues:

1. Check the browser console for detailed error messages
2. Check Railway logs for backend errors
3. Make sure all environment variables are set correctly
4. Try the `/health` endpoint to verify the backend is running
