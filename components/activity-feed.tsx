"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageSquare, UserPlus, Phone, Video } from "lucide-react"
import { useEffect, useState } from "react"

interface Activity {
  id: string
  type: "message" | "call" | "video" | "user_joined"
  chat: string
  sender?: string
  content?: string
  timestamp: string
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("/api/telegram/activities")
        if (response.ok) {
          const data = await response.json()
          setActivities(data)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch activities:", error)
      }
    }

    fetchActivities()
    const interval = setInterval(fetchActivities, 10000) // Update every 10s

    return () => clearInterval(interval)
  }, [])

  const getIcon = (type: Activity["type"]) => {
    switch (type) {
      case "message":
        return <MessageSquare className="h-4 w-4" />
      case "call":
        return <Phone className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "user_joined":
        return <UserPlus className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: Activity["type"]) => {
    switch (type) {
      case "message":
        return "Message"
      case "call":
        return "Call"
      case "video":
        return "Video Call"
      case "user_joined":
        return "User Joined"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Real-time updates from your Telegram account</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No recent activity. Waiting for updates...</p>
            ) : (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="mt-1 p-2 rounded-full bg-primary/10 text-primary">{getIcon(activity.type)}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{getTypeLabel(activity.type)}</Badge>
                      <span className="text-sm font-medium">{activity.chat}</span>
                    </div>
                    {activity.sender && <p className="text-sm text-muted-foreground">From: {activity.sender}</p>}
                    {activity.content && <p className="text-sm">{activity.content}</p>}
                    <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
