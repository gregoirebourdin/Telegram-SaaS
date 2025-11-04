import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone) {
      return NextResponse.json({ error: "Phone number is required" }, { status: 400 })
    }

    let backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    // Add https:// if no protocol is specified
    if (!backendUrl.startsWith("http://") && !backendUrl.startsWith("https://")) {
      backendUrl = `https://${backendUrl}`
    }

    console.log("[v0] Calling backend:", `${backendUrl}/api/send-code`)

    const response = await fetch(`${backendUrl}/api/send-code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    })

    console.log("[v0] Backend response status:", response.status)
    console.log("[v0] Backend response headers:", Object.fromEntries(response.headers.entries()))

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
          instructions:
            "1. Create a new Railway project\n2. Deploy only the 'backend/' folder\n3. Set TELEGRAM_API_ID and TELEGRAM_API_HASH in Railway\n4. Copy the Railway deployment URL and set it as BACKEND_URL",
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
      return NextResponse.json({ error: data.error || "Failed to send code" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Send code error:", error)
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
