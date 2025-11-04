import { type NextRequest, NextResponse } from "next/server"
import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions"

const API_ID = Number.parseInt(process.env.TELEGRAM_API_ID || "")
const API_HASH = process.env.TELEGRAM_API_HASH || ""

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber } = await request.json()

    if (!phoneNumber) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    if (!API_ID || !API_HASH) {
      return NextResponse.json({ error: "Telegram API credentials not configured" }, { status: 500 })
    }

    const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
      connectionRetries: 5,
    })

    await client.connect()

    const { phoneCodeHash } = await client.sendCode(
      {
        apiId: API_ID,
        apiHash: API_HASH,
      },
      phoneNumber,
    )

    await client.disconnect()

    return NextResponse.json({ phoneCodeHash })
  } catch (error) {
    console.error("Error sending code:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to send code" }, { status: 500 })
  }
}
