# Chatbase Integration Setup

This backend now includes automatic AI responses via Chatbase API.

## How It Works

When someone sends you a message on Telegram:
1. The message is received by the event handler
2. The full conversation history is retrieved
3. The message + history is sent to your Chatbase chatbot
4. Chatbase generates a response based on your assistant's knowledge
5. The response is automatically sent back to the sender on Telegram

## Configuration

You need to set two environment variables in Railway:

### 1. Get Your Chatbase API Key

1. Go to [Chatbase Dashboard](https://www.chatbase.co/dashboard)
2. Click on your profile → Settings → API
3. Copy your API key

### 2. Get Your Chatbot ID

1. Go to your chatbot in Chatbase
2. Click on Settings
3. Copy the Chatbot ID (it looks like: `abc123def456`)

### 3. Set Environment Variables in Railway

Add these to your Railway backend service:

\`\`\`bash
CHATBASE_API_KEY=your_api_key_here
CHATBASE_CHATBOT_ID=your_chatbot_id_here
\`\`\`

## Features

- **Conversation History**: The bot maintains conversation history per chat (last 50 messages)
- **Automatic Responses**: Responds automatically to all incoming text messages
- **Context Aware**: Sends full conversation history to Chatbase for context-aware responses
- **Activity Logging**: All messages are logged in the dashboard

## Testing

1. Set up the environment variables in Railway
2. Redeploy your backend
3. Send a message to your Telegram account from another account
4. You should see logs like:
   \`\`\`
   [v0] New message from John in John Doe: Hello!
   [v0] Calling Chatbase with 1 messages in history...
   [v0] Chatbase response: Hi! How can I help you?
   [v0] Sent response to John Doe
   \`\`\`

## Troubleshooting

If responses aren't working:

1. **Check logs**: Look for Chatbase API errors in Railway logs
2. **Verify credentials**: Make sure API key and Chatbot ID are correct
3. **Check Chatbase dashboard**: Verify your chatbot is active
4. **Test manually**: Try calling the Chatbase API directly to verify it works

## Disabling Auto-Responses

If you want to disable automatic responses, simply remove the `CHATBASE_API_KEY` environment variable. The bot will continue logging messages but won't respond.
