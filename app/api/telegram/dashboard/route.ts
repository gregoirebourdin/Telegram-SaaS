import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.headers.get("X-Session-Token")

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const fullBackendUrl = backendUrl.startsWith("http") ? backendUrl : `https://${backendUrl}`

    console.log("[v0] Fetching dashboard data from:", `${fullBackendUrl}/api/dashboard`)

    const response = await fetch(`${fullBackendUrl}/api/dashboard`, {
      headers: {
        "X-Session-Token": sessionToken,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Dashboard error response:", errorText)

      try {
        const errorData = JSON.parse(errorText)
        return NextResponse.json(errorData, { status: response.status })
      } catch {
        return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: response.status })
      }
    }

    const data = await response.json()
    console.log("[v0] Dashboard data received successfully")
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Dashboard route error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
