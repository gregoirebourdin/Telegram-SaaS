export interface TelegramUser {
  id: string
  firstName?: string
  lastName?: string
  username?: string
  phone?: string
}

export interface TelegramMessage {
  id: number
  text: string
  date: number
  out: boolean
  fromId?: string
}

export interface ChatActivity {
  chatId: string
  chatName: string
  chatType: "user" | "group" | "channel"
  unreadCount: number
  messages: TelegramMessage[]
}

export interface ActivityResponse {
  user: TelegramUser
  activity: ChatActivity[]
}

export interface AuthResponse {
  success?: boolean
  phoneCodeHash?: string
  error?: string
}
