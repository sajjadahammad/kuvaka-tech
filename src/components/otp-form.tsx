"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Phone, Lock } from "lucide-react"
import { toast } from "sonner" // Changed import to sonner

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
// Removed: import { useToast } from "@/components/ui/use-toast"
import { useAuthStore } from "@/lib/store"
import { OTP_SEND_DELAY, OTP_VERIFY_DELAY } from "@/lib/constants"
import CountrySelect from "./country-select"
import type { Country } from "../../types"

const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country code."),
  phoneNumber: z
    .string()
    .min(7, "Phone number must be at least 7 digits.")
    .max(15, "Phone number must not exceed 15 digits.")
    .regex(/^\d+$/, "Phone number must contain only digits."),
})

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits.")
    .max(6, "OTP must be 6 digits.")
    .regex(/^\d+$/, "OTP must contain only digits."),
})

type PhoneFormValues = z.infer<typeof phoneSchema>
type OtpFormValues = z.infer<typeof otpSchema>

export default function OtpForm() {
  // Removed: const { toast } = useToast()
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  const [step, setStep] = useState<"phone" | "otp">("phone")
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)
  const [fullPhoneNumber, setFullPhoneNumber] = useState<string>("")
  const [otpSent, setOtpSent] = useState<string>("") // Simulate OTP

  const phoneForm = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "",
      phoneNumber: "",
    },
  })

  const otpForm = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  })

  useEffect(() => {
    if (selectedCountry) {
      phoneForm.setValue("countryCode", selectedCountry.dialCode)
    }
  }, [selectedCountry, phoneForm])

  const handleSendOtp = async (values: PhoneFormValues) => {
    const fullNumber = `${values.countryCode}${values.phoneNumber}`
    setFullPhoneNumber(fullNumber)

    // Simulate OTP sending
    toast.loading(`OTP is being sent to ${fullNumber}...`, {
      id: "otp-send", // Use an ID to update this toast later
      description: "Please wait.",
    })

    await new Promise((resolve) => setTimeout(resolve, OTP_SEND_DELAY))

    const simulatedOtp = "123456" // For demonstration
    setOtpSent(simulatedOtp)
    setStep("otp")
    toast.success("OTP Sent!", {
      id: "otp-send", // Update the existing toast
      description: `A 6-digit OTP has been sent to ${fullNumber}. (Simulated OTP: ${simulatedOtp})`,
      duration: 5000,
    })
  }

  const handleVerifyOtp = async (values: OtpFormValues) => {
    // Simulate OTP verification
    toast.loading("Verifying OTP...", {
      id: "otp-verify",
      description: "Please wait while we verify your OTP.",
    })

    await new Promise((resolve) => setTimeout(resolve, OTP_VERIFY_DELAY))

    if (values.otp === otpSent) {
      login(fullPhoneNumber)
      toast.success("Login Successful!", {
        id: "otp-verify",
        description: "You have been successfully logged in.",
        duration: 2000,
      })
      router.push("/dashboard")
    } else {
      toast.error("Verification Failed", {
        id: "otp-verify",
        description: "The OTP you entered is incorrect. Please try again.",
        duration: 3000,
      })
      otpForm.setError("otp", { message: "Incorrect OTP" })
    }
  }

  return (
    <>
      {step === "phone" && (
        <Form {...phoneForm}>
          <form onSubmit={phoneForm.handleSubmit(handleSendOtp)} className="space-y-6">
            <FormField
              control={phoneForm.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country Code</FormLabel>
                  <FormControl>
                    <CountrySelect onSelectCountry={setSelectedCountry} value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={phoneForm.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="e.g., 1234567890" className="pl-10" type="tel" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={phoneForm.formState.isSubmitting}>
              {phoneForm.formState.isSubmitting ? "Sending..." : "Send OTP"}
            </Button>
          </form>
        </Form>
      )}

      {step === "otp" && (
        <Form {...otpForm}>
          <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-6">
            <p className="text-center text-sm text-muted-foreground">
              A 6-digit OTP has been sent to <span className="font-medium">{fullPhoneNumber}</span>.
            </p>
            <FormField
              control={otpForm.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>OTP</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Enter 6-digit OTP"
                        className="pl-10 text-center tracking-[0.25em]"
                        maxLength={6}
                        type="text"
                        inputMode="numeric"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={otpForm.formState.isSubmitting}>
              {otpForm.formState.isSubmitting ? "Verifying..." : "Verify OTP"}
            </Button>
            <Button type="button" variant="link" className="w-full" onClick={() => setStep("phone")}>
              Change Phone Number
            </Button>
          </form>
        </Form>
      )}
    </>
  )
}
