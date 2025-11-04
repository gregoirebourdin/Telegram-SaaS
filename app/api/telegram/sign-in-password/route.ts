import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 })
    }

    // Call your Railway backend API
    const backendUrl = process.env.BACKEND_URL || "http://localhost:8000"
    const response = await fetch(`${backendUrl}/api/sign-in-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: data.error || "Failed to sign in" }, { status: response.status })
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
    console.error("[v0] Sign in password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
