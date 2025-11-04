"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { SessionManager } from "@/lib/session-manager"
import { Loader2 } from "lucide-react"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    // Check if user has a session token in localStorage
    if (SessionManager.hasSession()) {
      router.push("/dashboard")
    } else {
      router.push("/auth")
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
