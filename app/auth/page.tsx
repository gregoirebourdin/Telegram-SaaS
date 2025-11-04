"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MessageSquare } from "lucide-react"
import { ApiClient } from "@/lib/api-client"

export default function AuthPage() {
  const router = useRouter()
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [code, setCode] = useState("")
  const [phoneCodeHash, setPhoneCodeHash] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const data = await ApiClient.sendVerificationCode(phoneNumber)

      if (data.phoneCodeHash) {
        setPhoneCodeHash(data.phoneCodeHash)
        setStep("code")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      await ApiClient.verifyCode(phoneNumber, code, phoneCodeHash)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary/10 rounded-full">
              <MessageSquare className="h-8 w-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Telegram Monitor</CardTitle>
          <CardDescription>
            {step === "phone"
              ? "Enter your phone number to get started"
              : "Enter the verification code sent to your Telegram"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {step === "phone" ? (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  disabled={loading}
                />
                <p className="text-sm text-muted-foreground">Include country code (e.g., +1 for US)</p>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Code...
                  </>
                ) : (
                  "Send Verification Code"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
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
                  maxLength={5}
                />
                <p className="text-sm text-muted-foreground">Check your Telegram app for the code</p>
              </div>
              <div className="space-y-2">
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setStep("phone")}
                  disabled={loading}
                >
                  Use Different Number
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
