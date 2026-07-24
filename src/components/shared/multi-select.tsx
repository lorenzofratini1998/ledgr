import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

interface MultiSelectProps {
  title: string
  options: { label: string; value: string }[]
  selectedValues: string[]
  onToggle: (value: string) => void
}

export function MultiSelect({
  title,
  options,
  selectedValues,
  onToggle
}: MultiSelectProps) {
  const [localOpen, setLocalOpen] = React.useState(false)
  const selectedLabels = selectedValues.map(v => options.find(o => o.value === v)?.label).filter(Boolean)

  return (
    <Popover open={localOpen} onOpenChange={setLocalOpen}>
      <PopoverTrigger render={
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={localOpen}
          className="w-full justify-between h-auto min-h-9 px-3 py-1.5"
        >
          <div className="flex flex-wrap gap-1 items-center max-w-[90%] overflow-hidden">
            {selectedLabels.length === 0 && <span className="text-muted-foreground font-normal">Select {title}...</span>}
            {selectedLabels.map(label => (
              <Badge variant="secondary" key={label} className="mr-1 text-xs px-1.5 py-0 font-normal">
                {label}
              </Badge>
            ))}
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      } />
      <PopoverContent className="w-[var(--anchor-width)] min-w-[200px] p-0" align="start">
        <Command>
          <CommandInput placeholder={`Search ${title}...`} />
          <CommandList>
            <CommandEmpty>No {title} found.</CommandEmpty>
            <CommandGroup className="max-h-64 overflow-auto">
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.label}
                  onSelect={() => onToggle(option.value)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
