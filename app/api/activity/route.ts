import { type NextRequest, NextResponse } from "next/server"
import { TelegramClient } from "telegram"
import { StringSession } from "telegram/sessions"
import { cookies } from "next/headers"

const API_ID = Number.parseInt(process.env.TELEGRAM_API_ID || "")
const API_HASH = process.env.TELEGRAM_API_HASH || ""

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionString = cookieStore.get("telegram_session")?.value

    if (!sessionString) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    if (!API_ID || !API_HASH) {
      return NextResponse.json({ error: "Telegram API credentials not configured" }, { status: 500 })
    }

    const client = new TelegramClient(new StringSession(sessionString), API_ID, API_HASH, {
      connectionRetries: 5,
    })

    await client.connect()

    // Get user info
    const me = await client.getMe()

    // Get recent dialogs (chats)
    const dialogs = await client.getDialogs({ limit: 10 })

    // Get recent messages from each dialog
    const recentActivity = await Promise.all(
      dialogs.slice(0, 5).map(async (dialog) => {
        const messages = await client.getMessages(dialog.entity, { limit: 5 })
        return {
          chatId: dialog.id,
          chatName: dialog.title || dialog.name || "Unknown",
          chatType: dialog.isUser ? "user" : dialog.isGroup ? "group" : "channel",
          unreadCount: dialog.unreadCount,
          messages: messages.map((msg) => ({
            id: msg.id,
            text: msg.text || "[Media]",
            date: msg.date,
            out: msg.out,
            fromId: msg.fromId?.toString(),
          })),
        }
      }),
    )

    await client.disconnect()

    return NextResponse.json({
      user: {
        id: me.id.toString(),
        firstName: me.firstName,
        lastName: me.lastName,
        username: me.username,
        phone: me.phone,
      },
      activity: recentActivity,
    })
  } catch (error) {
    console.error("Error fetching activity:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch activity" },
      { status: 500 },
    )
  }
}
