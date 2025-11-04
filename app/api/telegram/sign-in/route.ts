import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { phone, code, phoneCodeHash } = await request.json()

    if (!phone || !code || !phoneCodeHash) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    // Add https:// if no protocol is specified
    if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
      backendUrl = `https://${backendUrl}`
    }

    console.log("[v0] Calling backend:", `${backendUrl}/api/sign-in`)

    const response = await fetch(`${backendUrl}/api/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code, phoneCodeHash }),
    })

    console.log("[v0] Backend response status:", response.status)

    const contentType = response.headers.get("content-type")
    const server = response.headers.get("server")

    if (server === "Vercel" || contentType?.includes("text/html")) {
      const text = await response.text()
      console.error("[v0] Backend returned HTML (likely Next.js app):", text.substring(0, 200))
      return NextResponse.json(
        {
          error: "BACKEND_URL is pointing to a Next.js app, not the Python backend!",
          details: "You need to deploy ONLY the 'backend/' folder to Railway, not the entire repository.",
          backendUrl: backendUrl,
        },
        { status: 502 },
      )
    }

    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("[v0] Backend returned non-JSON response:", text.substring(0, 200))
      return NextResponse.json(
        {
          error: "Backend is not responding with JSON",
          details: `Expected JSON but got: ${contentType}`,
          backendUrl: backendUrl,
        },
        { status: 502 },
      )
    }

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
    return NextResponse.json(
      {
        error: "Failed to connect to backend",
        details: error instanceof Error ? error.message : String(error),
        backendUrl: process.env.BACKEND_URL || "http://localhost:8080",
      },
      { status: 500 },
    )
  }
}
