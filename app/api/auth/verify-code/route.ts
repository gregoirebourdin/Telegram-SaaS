import { type NextRequest, NextResponse } from "next/server"
import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions"
import { cookies } from "next/headers"

const API_ID = Number.parseInt(process.env.TELEGRAM_API_ID || "")
const API_HASH = process.env.TELEGRAM_API_HASH || ""

export async function POST(request: NextRequest) {
  try {
    const { phoneNumber, code, phoneCodeHash } = await request.json()

    if (!phoneNumber || !code || !phoneCodeHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!API_ID || !API_HASH) {
      return NextResponse.json({ error: "Telegram API credentials not configured" }, { status: 500 })
    }

    const client = new TelegramClient(new StringSession(""), API_ID, API_HASH, {
      connectionRetries: 5,
    })

    await client.connect()

    await client.invoke(
      new (await import("telegram/tl")).Api.auth.SignIn({
        phoneNumber,
        phoneCodeHash,
        phoneCode: code,
      }),
    )

    const session = client.session.save() as unknown as string

    await client.disconnect()

    const cookieStore = await cookies()
    cookieStore.set("telegram_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error verifying code:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify code" },
      { status: 500 },
    )
  }
}
