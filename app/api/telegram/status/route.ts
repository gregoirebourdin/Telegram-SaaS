import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get("X-Session-Token")

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"

    // Ensure URL has protocol
    const fullBackendUrl = backendUrl.startsWith("http") ? backendUrl : `https://${backendUrl}`

    const response = await fetch(`${fullBackendUrl}/api/status`, {
      headers: {
        "X-Session-Token": sessionToken,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      return NextResponse.json(errorData, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Status check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
