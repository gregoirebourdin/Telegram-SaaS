"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MessageSquare, Users, TrendingUp, Activity } from "lucide-react"
import { useEffect, useState } from "react"

interface Stats {
  totalMessages: number
  totalChats: number
  messagesChange: number
  activeNow: boolean
}

export function StatsCards() {
  const [stats, setStats] = useState<Stats>({
    totalMessages: 0,
    totalChats: 0,
    messagesChange: 0,
    activeNow: false,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/telegram/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch stats:", error)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 30000) // Update every 30s

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalMessages.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {stats.messagesChange > 0 ? "+" : ""}
            {stats.messagesChange} from last hour
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Chats</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalChats}</div>
          <p className="text-xs text-muted-foreground">Conversations monitored</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Activity Status</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {stats.activeNow ? (
              <span className="text-green-500">Active</span>
            ) : (
              <span className="text-muted-foreground">Idle</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Current status</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Growth</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+12.5%</div>
          <p className="text-xs text-muted-foreground">vs last week</p>
        </CardContent>
      </Card>
    </div>
  )
}
