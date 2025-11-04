import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionToken = cookieStore.get("telegram_session")

    if (!sessionToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = process.env.BACKEND_URL || "http://localhost:8080"
    const response = await fetch(`${backendUrl}/api/activities`, {
      headers: {
        Authorization: `Bearer ${sessionToken.value}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to fetch activities" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Activities error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
