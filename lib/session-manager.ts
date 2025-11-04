export class SessionManager {
  private static readonly SESSION_KEY = "telegram_session_token"

  static saveSession(token: string): void {
    if (typeof window !== "undefined") {
      localStorage.setItem(this.SESSION_KEY, token)
    }
  }

  static getSession(): string | null {
    if (typeof window !== "undefined") {
      return localStorage.getItem(this.SESSION_KEY)
    }
    return null
  }

  static clearSession(): void {
    if (typeof window !== "undefined") {
      localStorage.removeItem(this.SESSION_KEY)
    }
  }

  static hasSession(): boolean {
    return this.getSession() !== null
  }
}
