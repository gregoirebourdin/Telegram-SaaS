"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

type AuthStep = "phone" | "code" | "password"

export function TelegramAuthForm() {
  const [step, setStep] = useState<AuthStep>("phone")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [phoneCodeHash, setPhoneCodeHash] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/telegram/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send code")
      }

      setPhoneCodeHash(data.phoneCodeHash)
      setStep("code")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/telegram/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code, phoneCodeHash }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.needPassword) {
          setStep("password")
          return
        }
        throw new Error(data.error || "Failed to sign in")
      }

      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/telegram/sign-in-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign in")
      }

      window.location.href = "/dashboard"
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {step === "phone" && "Enter Phone Number"}
          {step === "code" && "Enter Verification Code"}
          {step === "password" && "Enter 2FA Password"}
        </CardTitle>
        <CardDescription>
          {step === "phone" && "Enter your Telegram phone number with country code"}
          {step === "code" && "Check your Telegram app for the verification code"}
          {step === "password" && "Enter your two-factor authentication password"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {step === "phone" && (
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Code
            </Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="code">Verification Code</Label>
              <Input
                id="code"
                type="text"
                placeholder="12345"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Verify
            </Button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">2FA Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sign In
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
