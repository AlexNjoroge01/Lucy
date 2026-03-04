import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import { ChevronDown, X } from "lucide-react"

export interface MultiSelectOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface MultiSelectProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select options...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((item) => item !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const handleRemove = (value: string) => {
    onChange(selected.filter((item) => item !== value))
  }

  const selectedOptions = options.filter((option) =>
    selected.includes(option.value)
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between min-h-[40px] h-auto", className)}
        >
          <div className="flex flex-wrap gap-1 items-center">
            {selectedOptions.length === 0 && (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
            {selectedOptions.map((option) => (
              <Badge
                key={option.value}
                variant="secondary"
                className="mr-1 gap-1"
                onClick={(e) => {
                  e.stopPropagation()
                  handleRemove(option.value)
                }}
              >
                {option.icon && (
                  <span className="mr-1">{option.icon}</span>
                )}
                {option.label}
                <X className="h-3 w-3 cursor-pointer" />
              </Badge>
            ))}
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <div className="max-h-[300px] overflow-auto p-2">
          {options.map((option) => (
            <div
              key={option.value}
              className="flex items-center space-x-2 p-2 hover:bg-accent rounded cursor-pointer"
              onClick={() => handleSelect(option.value)}
            >
              <Checkbox
                checked={selected.includes(option.value)}
                onChange={() => {}}
              />
              <span className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </span>
            </div>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
