"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore, useChatStore } from "@/lib/store"
import ChatInterface from "@/components/chat-interface"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner" // Changed import to sonner
import { CHATROOM_TITLE_MAX_LENGTH } from "@/lib/constants"

export default function DashboardPage() {
  const router = useRouter()
  // Removed: const { toast } = useToast()
  const isLoggedIn = useAuthStore((state) => state.isLoggedIn)
  const currentChatroomId = useChatStore((state) => state.currentChatroomId)
  const chatrooms = useChatStore((state) => state.chatrooms)
  const setCurrentChatroom = useChatStore((state) => state.setCurrentChatroom)
  const addChatroom = useChatStore((state) => state.addChatroom)

  const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)
  const [newChatroomTitle, setNewChatroomTitle] = useState("")

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login")
    }
  }, [isLoggedIn, router])

  useEffect(() => {
    // If no chatroom is selected and there are chatrooms, select the first one
    if (!currentChatroomId && chatrooms.length > 0) {
      setCurrentChatroom(chatrooms[0].id)
    }
  }, [currentChatroomId, chatrooms, setCurrentChatroom])

  const handleCreateChatroom = () => {
    if (newChatroomTitle.trim() === "") {
      toast.error("Chatroom title cannot be empty.")
      return
    }
    addChatroom(newChatroomTitle.trim())
    setNewChatroomTitle("")
    setIsCreatingChatroom(false)
    toast.success("Chatroom Created!", {
      description: `"${newChatroomTitle}" has been added.`,
    })
  }

  if (!isLoggedIn) {
    return null // Or a loading spinner while redirecting
  }

  return (
    <div className="flex h-svh flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-background px-4 md:px-6">
        {/* SidebarTrigger is now always visible */}
        <SidebarTrigger />
        <h1 className="text-lg font-semibold md:text-xl">
          {currentChatroomId
            ? chatrooms.find((room) => room.id === currentChatroomId)?.title || "Chatroom"
            : "Select a Chatroom"}
        </h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        {currentChatroomId ? (
          <ChatInterface chatroomId={currentChatroomId} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-muted-foreground">
            <p className="text-center">Select a chatroom from the sidebar or create a new one to start chatting.</p>
            <Button onClick={() => setIsCreatingChatroom(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create New Chatroom
            </Button>
          </div>
        )}
      </div>

      {/* New Chatroom Dialog (duplicated for central access) */}
      <AlertDialog open={isCreatingChatroom} onOpenChange={setIsCreatingChatroom}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create New Chatroom</AlertDialogTitle>
            <AlertDialogDescription>Enter a title for your new chatroom.</AlertDialogDescription>
          </AlertDialogHeader>
          <Input
            placeholder="e.g., My New Project Chat"
            value={newChatroomTitle}
            onChange={(e) => {
              if (e.target.value.length <= CHATROOM_TITLE_MAX_LENGTH) {
                setNewChatroomTitle(e.target.value)
              }
            }}
            maxLength={CHATROOM_TITLE_MAX_LENGTH}
          />
          <p className="text-right text-sm text-muted-foreground">
            {newChatroomTitle.length}/{CHATROOM_TITLE_MAX_LENGTH}
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNewChatroomTitle("")}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateChatroom}>Create</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
