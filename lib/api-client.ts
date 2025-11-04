import type { ActivityResponse, AuthResponse } from "@/types/telegram"
import { SessionManager } from "./session-manager"

export class ApiClient {
  private static async request<T>(url: string, options?: RequestInit): Promise<T> {
    const sessionToken = SessionManager.getSession()

    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(sessionToken && { "X-Session-Token": sessionToken }),
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        SessionManager.clearSession()
      }
      throw new Error(JSON.stringify(data))
    }

    return data
  }

  static async sendVerificationCode(phoneNumber: string): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/telegram/send-code", {
      method: "POST",
      body: JSON.stringify({ phone: phoneNumber }),
    })
  }

  static async verifyCode(phoneNumber: string, code: string, phoneCodeHash: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/telegram/sign-in", {
      method: "POST",
      body: JSON.stringify({ phone: phoneNumber, code, phoneCodeHash }),
    })

    if (response.sessionToken) {
      SessionManager.saveSession(response.sessionToken)
    }

    return response
  }

  static async checkStatus(): Promise<{ connected: boolean; user?: any }> {
    return this.request<{ connected: boolean; user?: any }>("/api/telegram/status")
  }

  static async getActivity(): Promise<ActivityResponse> {
    return this.request<ActivityResponse>("/api/telegram/stats")
  }

  static async logout(): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/api/telegram/logout", {
      method: "POST",
    })
    SessionManager.clearSession()
    return response
  }
}
