"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"
import { useEffect, useState } from "react"

interface ChartData {
  time: string
  messages: number
}

export function ActivityChart() {
  const [data, setData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await fetch("/api/telegram/activity-chart")
        if (response.ok) {
          const chartData = await response.json()
          setData(chartData)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch chart data:", error)
      }
    }

    fetchChartData()
    const interval = setInterval(fetchChartData, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Message Activity</CardTitle>
        <CardDescription>Messages received over the last 12 hours</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />
            <Line type="monotone" dataKey="messages" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
