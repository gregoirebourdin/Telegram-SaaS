"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, MessageSquare, Users, Radio, Loader2, RefreshCw, User } from "lucide-react"
import { ApiClient } from "@/lib/api-client"
import { SessionManager } from "@/lib/session-manager"
import type { ActivityResponse } from "@/types/telegram"

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<ActivityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const checkSession = async () => {
      if (!SessionManager.hasSession()) {
        router.push("/auth")
        return
      }

      try {
        // Verify session is still valid
        await ApiClient.checkStatus()
        fetchActivity()
      } catch (err) {
        // Session invalid, redirect to auth
        SessionManager.clearSession()
        router.push("/auth")
      }
    }

    checkSession()
  }, [router])

  const fetchActivity = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError("")

    try {
      const result = await ApiClient.getActivity()
      setData(result)
    } catch (err) {
      if (err instanceof Error && err.message.includes("401")) {
        router.push("/auth")
        return
      }
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleLogout = async () => {
    try {
      await ApiClient.logout()
      router.push("/auth")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getChatIcon = (type: string) => {
    switch (type) {
      case "user":
        return <User className="h-4 w-4" />
      case "group":
        return <Users className="h-4 w-4" />
      case "channel":
        return <Radio className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your activity...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto p-4 md:p-6 lg:p-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-balance">Telegram Monitor</h1>
            <p className="text-muted-foreground mt-1">Track your Telegram activity in real-time</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => fetchActivity(true)} disabled={refreshing}>
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="ml-2">Refresh</span>
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {data && (
          <>
            {/* User Info Card */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Account Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-primary/10 text-primary">
                      {data.user.firstName?.[0] || "U"}
                      {data.user.lastName?.[0] || ""}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="font-semibold text-lg">
                      {data.user.firstName} {data.user.lastName}
                    </p>
                    {data.user.username && <p className="text-sm text-muted-foreground">@{data.user.username}</p>}
                    {data.user.phone && <p className="text-sm text-muted-foreground">{data.user.phone}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Active Chats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{data.activity.length}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Unread Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.activity.reduce((sum, chat) => sum + chat.unreadCount, 0)}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {data.activity.reduce((sum, chat) => sum + chat.messages.length, 0)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Activity
                </CardTitle>
                <CardDescription>Your latest messages from active conversations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {data.activity.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">No recent activity found</div>
                ) : (
                  data.activity.map((chat) => (
                    <div key={chat.chatId} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-2 bg-primary/10 rounded-full">{getChatIcon(chat.chatType)}</div>
                          <div>
                            <h3 className="font-semibold">{chat.chatName}</h3>
                            <p className="text-sm text-muted-foreground capitalize">{chat.chatType}</p>
                          </div>
                        </div>
                        {chat.unreadCount > 0 && <Badge variant="default">{chat.unreadCount} unread</Badge>}
                      </div>

                      <div className="space-y-2 pl-12">
                        {chat.messages.map((message) => (
                          <div
                            key={message.id}
                            className={`p-3 rounded-lg border ${
                              message.out ? "bg-primary/5 border-primary/20" : "bg-muted/50 border-border"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <p className="text-sm flex-1 text-pretty">{message.text || "[No text content]"}</p>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {formatDate(message.date)}
                              </span>
                            </div>
                            {message.out && (
                              <Badge variant="secondary" className="mt-2 text-xs">
                                Sent by you
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
