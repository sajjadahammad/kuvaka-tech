"use client"

import { useState } from "react"
import type { Message } from "@/types"
import { cn, formatTimestamp } from "@/lib/utils"
import { Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner" // Changed import to sonner
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface MessageDisplayProps {
  message: Message
}

export default function MessageDisplay({ message }: MessageDisplayProps) {
  // Removed: const { toast } = useToast()
  const [showCopy, setShowCopy] = useState(false)

  const isUser = message.sender === "user"

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text)
      toast.success("Copied!", {
        description: "Message copied to clipboard.",
        duration: 1500,
      })
    }
  }

  return (
    <div
      className={cn("flex items-start gap-3 py-2", isUser ? "justify-end" : "justify-start")}
      onMouseEnter={() => setShowCopy(true)}
      onMouseLeave={() => setShowCopy(false)}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Gemini Avatar" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
      )}
      <div
        className={cn(
          "relative flex max-w-[70%] flex-col rounded-lg p-3",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
        )}
      >
        {message.text && <p className="text-sm break-words">{message.text}</p>}
        {message.imageUrl && (
          <img
            src={message.imageUrl || "/placeholder.svg"}
            alt="Uploaded image"
            className="mt-2 max-h-48 w-auto rounded-md object-contain"
          />
        )}
        <span className={cn("mt-1 text-xs", isUser ? "text-primary-foreground/80" : "text-muted-foreground/80")}>
          {formatTimestamp(message.timestamp)}
        </span>
        {message.text && showCopy && (
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute -top-2",
              isUser ? "-left-8" : "-right-8",
              "h-7 w-7 rounded-full bg-background text-foreground shadow-sm hover:bg-accent",
            )}
            onClick={handleCopy}
            aria-label="Copy message"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User Avatar" />
          <AvatarFallback>You</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
