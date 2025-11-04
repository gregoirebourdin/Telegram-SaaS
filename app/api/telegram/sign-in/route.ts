import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { phone, code, phoneCodeHash } = await request.json()

    if (!phone || !code || !phoneCodeHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Call your Railway backend API
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const response = await fetch(`${backendUrl}/api/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, phoneCodeHash }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    // Set session cookie
    if (data.sessionToken) {
      const cookieStore = await cookies()
      cookieStore.set("telegram_session", data.sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Sign in error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
