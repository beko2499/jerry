"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

function Switch({ checked = false, onCheckedChange, disabled = false, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer rounded-full transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50",
        checked ? "bg-cyan-500 shadow-[0_0_10px_rgba(0,255,255,0.3)]" : "bg-white/20",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] block h-[18px] w-[18px] rounded-full bg-white shadow-md transition-all duration-200",
          checked ? "left-[19px]" : "left-[3px]"
        )}
      />
    </button>
  )
}

export { Switch }

