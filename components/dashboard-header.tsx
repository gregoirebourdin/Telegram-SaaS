"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Settings } from "lucide-react"
import { useRouter } from "next/navigation"

export function DashboardHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/telegram/logout", { method: "POST" })
    router.push("/auth")
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto flex items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold">T</span>
          </div>
          <span className="font-semibold text-lg">Telegram Monitor</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
