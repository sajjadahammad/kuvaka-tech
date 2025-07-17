export interface Country {
  name: {
    common: string
  }
  idd: {
    root: string
    suffixes: string[]
  }
}

export interface User {
  id: string
  phone: string
}

export interface Message {
  id: string
  sender: "user" | "ai"
  text?: string
  imageUrl?: string
  timestamp: string
}

export interface Chatroom {
  id: string
  title: string
  createdAt: string
  messages: Message[]
}

export interface AuthState {
  isLoggedIn: boolean
  user: User | null
  login: (phone: string) => void
  logout: () => void
  setLoggedIn: (loggedIn: boolean) => void
  setUser: (user: User | null) => void
}

export interface ChatState {
  chatrooms: Chatroom[]
  currentChatroomId: string | null
  isGeminiTyping: boolean
  addChatroom: (title: string) => void
  deleteChatroom: (id: string) => void
  setCurrentChatroom: (id: string | null) => void
  addMessage: (chatroomId: string, message: Message) => void
  setGeminiTyping: (isTyping: boolean) => void
  loadMoreMessages: (chatroomId: string) => void
}
