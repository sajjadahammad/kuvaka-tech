"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import type { Country } from "../../types"

interface CountrySelectProps {
  onSelectCountry: (country: Country) => void
  value: string
  onChange: (value: string) => void
}

export default function CountrySelect({ onSelectCountry, value, onChange }: CountrySelectProps) {
  const [open, setOpen] = React.useState(false)
  const [countries, setCountries] = React.useState<
    (Country & {
      dialCode: string // Add dialCode directly to the processed country object
    })[]
  >([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    const fetchCountries = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://restcountries.com/v3.1/all?fields=name,idd")
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data: Country[] = await response.json()

        const processedCountries = data
          .filter(
            (country) => country.idd?.root, // Only filter by existence of root dial code
          )
          .map((country) => {
            const root = country.idd?.root || ""
            const suffix = country.idd?.suffixes?.[0] || "" // Use first suffix if available, otherwise empty string
            const dialCode = root + suffix

            return {
              ...country,
              dialCode: dialCode, // Store the constructed dial code
            }
          })
          .sort((a, b) => a.name.common.localeCompare(b.name.common))

        setCountries(processedCountries)
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
          console.error("Failed to fetch countries:", e)
        } else {
          setError("An unknown error occurred")
          console.error("Failed to fetch countries:", e)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchCountries()
  }, [])

  const selectedCountry = React.useMemo(() => {
    return countries.find((country) => country.dialCode === value)
  }, [countries, value])

  if (loading) {
    return <Skeleton className="h-10 w-full" />
  }

  if (error) {
    return <div className="text-destructive text-sm">Error loading countries: {error}</div>
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-transparent"
        >
          {selectedCountry ? `${selectedCountry.name.common} (${selectedCountry.dialCode})` : "Select country code..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popper-anchor-width] p-0">
        <Command>
          <CommandInput placeholder="Search country..." />
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.name.common}
                  value={`${country.name.common} ${country.dialCode}`}
                  onSelect={() => {
                    onSelectCountry(country)
                    onChange(country.dialCode)
                    setOpen(false)
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === country.dialCode ? "opacity-100" : "opacity-0")} />
                  {country.name.common} ({country.dialCode})
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
