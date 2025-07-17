"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { useChatStore } from "@/lib/store"
import MessageInput from "./message-input"
import MessageDisplay from "./message-display"
import { MESSAGES_PER_PAGE } from "@/lib/constants"
import { Loader2 } from "lucide-react"
import { throttle } from "@/lib/utils"

interface ChatInterfaceProps {
  chatroomId: string
}

export default function ChatInterface({ chatroomId }: ChatInterfaceProps) {
  const chatrooms = useChatStore((state) => state.chatrooms)
  const isGeminiTyping = useChatStore((state) => state.isGeminiTyping)
  const loadMoreMessages = useChatStore((state) => state.loadMoreMessages)

  const chatroom = chatrooms.find((room) => room.id === chatroomId)
  const messages = chatroom?.messages || []

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isLoadingOlderMessages, setIsLoadingOlderMessages] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true) // Simulate if more messages are available

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages.length, isGeminiTyping]) // Scroll when messages change or typing indicator changes

  // Simulate loading older messages
  const handleLoadOlderMessages = useCallback(
    throttle(async () => {
      if (isLoadingOlderMessages || !hasMoreMessages || !scrollContainerRef.current) {
        return
      }

      const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current

      // Trigger when scrolled near the top (e.g., within 100px of top)
      if (scrollTop < 100 && messages.length > 0) {
        setIsLoadingOlderMessages(true)
        const previousScrollHeight = scrollHeight

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Simulate loading more messages
        loadMoreMessages(chatroomId)

        // Simulate no more messages after a few loads
        if (messages.length > MESSAGES_PER_PAGE * 3) {
          setHasMoreMessages(false)
        }

        setIsLoadingOlderMessages(false)

        // Adjust scroll position to maintain view
        if (scrollContainerRef.current) {
          const newScrollHeight = scrollContainerRef.current.scrollHeight
          scrollContainerRef.current.scrollTop = newScrollHeight - previousScrollHeight
        }
      }
    }, 500), // Throttle to prevent excessive calls
    [chatroomId, isLoadingOlderMessages, hasMoreMessages, messages.length, loadMoreMessages],
  )

  useEffect(() => {
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleLoadOlderMessages)
      return () => {
        container.removeEventListener("scroll", handleLoadOlderMessages)
      }
    }
  }, [handleLoadOlderMessages])

  if (!chatroom) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>Chatroom not found.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex flex-1 flex-col-reverse overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thumb-muted scrollbar-track-background"
      >
        <div ref={messagesEndRef} /> {/* Scroll target */}
        {isGeminiTyping && (
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Gemini is typing...</span>
          </div>
        )}
        {messages.length === 0 && !isGeminiTyping && (
          <div className="flex flex-1 items-center justify-center text-muted-foreground">
            <p>Start a conversation with Gemini!</p>
          </div>
        )}
        {messages
          .slice()
          .reverse()
          .map((message) => (
            <MessageDisplay key={message.id} message={message} />
          ))}
        {isLoadingOlderMessages && (
          <div className="flex justify-center py-2">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
        {!hasMoreMessages && messages.length > 0 && (
          <div className="text-center text-sm text-muted-foreground py-2">No older messages.</div>
        )}
      </div>
      <MessageInput chatroomId={chatroomId} />
    </div>
  )
}
