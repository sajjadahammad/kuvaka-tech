"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Send, ImageIcon } from "lucide-react"
import { v4 as uuidv4 } from "uuid"
import { toast } from "sonner" // Changed import to sonner

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// Removed: import { useToast } from "@/components/ui/use-toast"
import { useChatStore } from "@/lib/store"
import type { Message } from "../../types"
import Image from "next/image"

const formSchema = z.object({
  message: z.string().max(1000).optional(),
  image: z.any().optional(), // For file input
})

interface MessageInputProps {
  chatroomId: string
}

export default function MessageInput({ chatroomId }: MessageInputProps) {
  // Removed: const { toast } = useToast()
  const addMessage = useChatStore((state) => state.addMessage)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: "",
      image: undefined,
    },
  })

  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image too large", {
          description: "Please select an image smaller than 5MB.",
        })
        form.setValue("image", undefined)
        setImagePreview(null)
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        form.setValue("image", reader.result as string) // Store as base64
      }
      reader.readAsDataURL(file)
    } else {
      setImagePreview(null)
      form.setValue("image", undefined)
    }
  }

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const text = values.message?.trim()
    const imageUrl = values.image

    if (!text && !imageUrl) {
      toast.error("Cannot send empty message", {
        description: "Please type a message or select an image.",
      })
      return
    }

    const newMessage: Message = {
      id: uuidv4(),
      sender: "user",
      timestamp: new Date().toISOString(),
      ...(text && { text }),
      ...(imageUrl && { imageUrl }),
    }

    addMessage(chatroomId, newMessage)
    form.reset()
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = "" // Clear file input
    }
    toast.success("Message Sent!", {
      description: "Your message has been sent to Gemini.",
    })
  }

  return (
    <div className="border-t bg-background p-4">
      {imagePreview && (
        <div className="relative mb-4 h-32 w-32 overflow-hidden rounded-md border">
          <Image src={imagePreview || "/placeholder.svg"} alt="Image preview" width={100} height={100} className="h-full w-full object-cover" />
          <Button
            variant="destructive"
            size="icon"
            className="absolute right-1 top-1 h-6 w-6 rounded-full"
            onClick={() => {
              setImagePreview(null)
              form.setValue("image", undefined)
              if (fileInputRef.current) {
                fileInputRef.current.value = ""
              }
            }}
          >
            X
          </Button>
        </div>
      )}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Message Gemini..."
                    className="pr-10"
                    {...field}
                    disabled={form.formState.isSubmitting}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageChange} />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            aria-label="Upload Image"
            disabled={form.formState.isSubmitting}
          >
            <ImageIcon className="h-5 w-5" />
          </Button>
          <Button type="submit" size="icon" disabled={form.formState.isSubmitting}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send Message</span>
          </Button>
        </form>
      </Form>
    </div>
  )
}
