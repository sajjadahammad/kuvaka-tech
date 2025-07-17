"use client"

import { SidebarMenuAction } from "@/components/ui/sidebar"

import { useState, useMemo } from "react"
import { Home, Plus, MessageSquare, Trash2, Moon, Sun, LogOut } from "lucide-react"
import { useTheme } from "next-themes"
import { toast } from "sonner" // Changed import to sonner

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
// Removed: import { useToast } from "@/components/ui/use-toast"
import { useAuthStore, useChatStore } from "@/lib/store"
import { debounce } from "@/lib/utils"
import { CHATROOM_TITLE_MAX_LENGTH } from "@/lib/constants"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Input } from "@/components/ui/input"

export function AppSidebar() {
  // Removed: const { toast } = useToast()
  const { setTheme, theme } = useTheme()
  const { toggleSidebar, state } = useSidebar()
  const logout = useAuthStore((state) => state.logout)

  const chatrooms = useChatStore((state) => state.chatrooms)
  const currentChatroomId = useChatStore((state) => state.currentChatroomId)
  const addChatroom = useChatStore((state) => state.addChatroom)
  const deleteChatroom = useChatStore((state) => state.deleteChatroom)
  const setCurrentChatroom = useChatStore((state) => state.setCurrentChatroom)

  const [searchTerm, setSearchTerm] = useState("")
  const [newChatroomTitle, setNewChatroomTitle] = useState("")
  const [isCreatingChatroom, setIsCreatingChatroom] = useState(false)

  const debouncedSearch = useMemo(
    () =>
      debounce((term: string) => {
        setSearchTerm(term)
      }, 300),
    [],
  )

  const filteredChatrooms = useMemo(() => {
    if (!searchTerm) {
      return chatrooms
    }
    return chatrooms.filter((room) => room.title.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [chatrooms, searchTerm])

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

  const handleDeleteChatroom = (id: string, title: string) => {
    deleteChatroom(id)
    toast.success("Chatroom Deleted!", {
      description: `"${title}" has been removed.`,
    })
  }

  const handleLogout = () => {
    logout()
    toast("Logged Out", {
      description: "You have been successfully logged out.",
    })
  }

  return (
    <Sidebar collapsible="icon">
      {" "}
      {/* Changed to "icon" for better desktop discoverability */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="/dashboard">
                <Home />
                {state !== "collapsed" && <span>Dashboard</span>}
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chatrooms</SidebarGroupLabel>
          <SidebarGroupAction title="New Chatroom" onClick={() => setIsCreatingChatroom(true)}>
            <Plus /> <span className="sr-only">New Chatroom</span>
          </SidebarGroupAction>
          <SidebarGroupContent>
            <SidebarInput placeholder="Search chatrooms..." onChange={(e) => debouncedSearch(e.target.value)} className="mb-3" />
            <SidebarMenu>
              {filteredChatrooms.length === 0 && (
                <SidebarMenuItem>
                  <span className="text-muted-foreground px-2 py-1 text-sm">No chatrooms found.</span>
                </SidebarMenuItem>
              )}
              {filteredChatrooms.map((room) => (
                <SidebarMenuItem key={room.id}>
                  <SidebarMenuButton
                    isActive={currentChatroomId === room.id}
                    onClick={() => setCurrentChatroom(room.id)}
                  >
                    <MessageSquare />
                    {state !== "collapsed" && <span>{room.title}</span>}
                  </SidebarMenuButton>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <SidebarMenuAction showOnHover>
                        <Trash2 className="text-destructive" />
                        <span className="sr-only">Delete Chatroom</span>
                      </SidebarMenuAction>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the chatroom &quot;{room.title}
                          &quot; and all its messages.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteChatroom(room.id, room.title)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
              {state !== "collapsed" && <span>Toggle Theme ({theme === "dark" ? "Light" : "Dark"})</span>}
            </Button>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut />
              {state !== "collapsed" && <span>Logout</span>}
            </Button>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      {/* New Chatroom Dialog */}
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
    </Sidebar>
  )
}
