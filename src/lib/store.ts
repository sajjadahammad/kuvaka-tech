import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { v4 as uuidv4 } from "uuid"

import type { AuthState, ChatState, Chatroom, Message, User } from "../../types"
import { AI_RESPONSE_DELAY, MESSAGES_PER_PAGE } from "@/lib/constants"

// --- Auth Store ---
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isLoggedIn: false,
      user: null,
      login: (phone: string) => {
        const newUser: User = { id: uuidv4(), phone }
        set({ isLoggedIn: true, user: newUser })
      },
      logout: () => set({ isLoggedIn: false, user: null }),
      setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setUser: (user) => set({ user: user }),
    }),
    {
      name: "gemini-clone-auth-storage", // name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
    },
  ),
)

// --- Chat Store ---
export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      chatrooms: [],
      currentChatroomId: null,
      isGeminiTyping: false,

      addChatroom: (title: string) => {
        const newChatroom: Chatroom = {
          id: uuidv4(),
          title,
          createdAt: new Date().toISOString(),
          messages: [],
        }
        set((state) => ({
          chatrooms: [newChatroom, ...state.chatrooms],
          currentChatroomId: newChatroom.id, // Automatically select new chatroom
        }))
      },

      deleteChatroom: (id: string) => {
        set((state) => {
          const updatedChatrooms = state.chatrooms.filter((room) => room.id !== id)
          let newCurrentChatroomId = state.currentChatroomId
          if (newCurrentChatroomId === id) {
            newCurrentChatroomId = updatedChatrooms[0]?.id || null
          }
          return {
            chatrooms: updatedChatrooms,
            currentChatroomId: newCurrentChatroomId,
          }
        })
      },

      setCurrentChatroom: (id: string | null) => set({ currentChatroomId: id }),

      addMessage: (chatroomId: string, message: Message) => {
        set((state) => {
          const updatedChatrooms = state.chatrooms.map((room) =>
            room.id === chatroomId ? { ...room, messages: [...room.messages, message] } : room,
          )
          return { chatrooms: updatedChatrooms }
        })

        // Simulate AI response if the message is from the user
        if (message.sender === "user") {
          get().setGeminiTyping(true)
          setTimeout(() => {
            const aiResponse: Message = {
              id: uuidv4(),
              sender: "ai",
              text: `Hello! You said: "${message.text || "an image"}". I am Gemini, how can I help you today?`,
              timestamp: new Date().toISOString(),
            }
            set((state) => {
              const updatedChatrooms = state.chatrooms.map((room) =>
                room.id === chatroomId ? { ...room, messages: [...room.messages, aiResponse] } : room,
              )
              return { chatrooms: updatedChatrooms }
            })
            get().setGeminiTyping(false)
          }, AI_RESPONSE_DELAY)
        }
      },

      setGeminiTyping: (isTyping: boolean) => set({ isGeminiTyping: isTyping }),

      loadMoreMessages: (chatroomId: string) => {
        set((state) => {
          const chatroom = state.chatrooms.find((room) => room.id === chatroomId)
          if (!chatroom) return state

          const currentMessagesCount = chatroom.messages.length
          // In a real app, you'd fetch from a backend. Here, we simulate by
          // generating more dummy messages or loading from a larger dummy set.
          // For simplicity, we'll just assume there are always more messages to "load"
          // and prepend some dummy ones.
          const newDummyMessages: Message[] = Array.from({ length: MESSAGES_PER_PAGE }, (_, i) => ({
            id: uuidv4(),
            sender: i % 2 === 0 ? "user" : "ai",
            text: `Older message ${currentMessagesCount + MESSAGES_PER_PAGE - i} in this chat.`,
            timestamp: new Date(
              new Date().getTime() - (currentMessagesCount + MESSAGES_PER_PAGE - i) * 60 * 1000,
            ).toISOString(),
          })).reverse() // Ensure older messages have older timestamps

          const updatedChatrooms = state.chatrooms.map((room) =>
            room.id === chatroomId ? { ...room, messages: [...newDummyMessages, ...room.messages] } : room,
          )
          return { chatrooms: updatedChatrooms }
        })
      },
    }),
    {
      name: "gemini-clone-chat-storage", // name of the item in localStorage
      storage: createJSONStorage(() => localStorage),
      // Only store necessary parts to avoid circular references or large objects
      partialize: (state) => ({
        chatrooms: state.chatrooms,
        currentChatroomId: state.currentChatroomId,
      }),
    },
  ),
)
