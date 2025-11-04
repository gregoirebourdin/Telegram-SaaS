# Telegram Activity Monitor

A Next.js application that allows you to monitor your Telegram account activity in real-time using the Telegram API.

## Features

- **Telegram Authentication**: Secure phone number and verification code authentication
- **Activity Dashboard**: View recent messages from your active conversations
- **Real-time Stats**: Track active chats, unread messages, and total messages
- **User Profile**: Display your Telegram account information
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Prerequisites

Before you begin, you need to obtain Telegram API credentials:

1. Visit [https://my.telegram.org](https://my.telegram.org)
2. Log in with your phone number
3. Go to "API development tools"
4. Create a new application
5. Copy your `api_id` and `api_hash`

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

\`\`\`env
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here
\`\`\`

## Installation

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Add your environment variables to `.env.local`
4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. **Authentication**: Enter your phone number (with country code) and click "Send Verification Code"
2. **Verification**: Check your Telegram app for the verification code and enter it
3. **Dashboard**: Once authenticated, you'll see your activity dashboard with:
   - Your account information
   - Activity statistics
   - Recent messages from your conversations

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Telegram API**: Telegram (GramJS)
- **Authentication**: Cookie-based sessions

## Security Notes

- Your Telegram session is stored securely in HTTP-only cookies
- API credentials are never exposed to the client
- All API calls are made server-side
- Sessions expire after 30 days

## Deployment

This app can be deployed to Vercel:

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add your environment variables in the Vercel dashboard
4. Deploy

## License

MIT
