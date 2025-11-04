import type { ActivityResponse, AuthResponse } from "@/types/telegram"

export class ApiClient {
  private static async request<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || `Request failed with status ${response.status}`)
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
    return this.request<AuthResponse>("/api/telegram/sign-in", {
      method: "POST",
      body: JSON.stringify({ phone: phoneNumber, code, phoneCodeHash }),
    })
  }

  static async getActivity(): Promise<ActivityResponse> {
    return this.request<ActivityResponse>("/api/telegram/stats")
  }

  static async logout(): Promise<AuthResponse> {
    return this.request<AuthResponse>("/api/telegram/logout", {
      method: "POST",
    })
  }
}
