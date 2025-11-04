import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions"

const API_ID = Number.parseInt(process.env.TELEGRAM_API_ID || "")
const API_HASH = process.env.TELEGRAM_API_HASH || ""

export async function createTelegramClient(sessionString: string) {
  if (!API_ID || !API_HASH) {
    throw new Error("Telegram API credentials not configured")
  }

  const client = new TelegramClient(new StringSession(sessionString), API_ID, API_HASH, {
    connectionRetries: 5,
  })

  await client.connect()
  return client
}

export { API_ID, API_HASH }
