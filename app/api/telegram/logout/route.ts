import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.headers.get("X-Session-Token")

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    // Ensure URL has protocol
    const fullBackendUrl = backendUrl.startsWith("http") ? backendUrl : `https://${backendUrl}`

    // Call backend logout to cleanup session
    const response = await fetch(`${fullBackendUrl}/api/logout`, {
      method: "POST",
      headers: {
        "X-Session-Token": sessionToken,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Logout failed" }))
      return NextResponse.json(errorData, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
