"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
}

function Switch({ checked = false, onCheckedChange, disabled = false, className, id, name }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      id={id}
      disabled={disabled}
      onClick={() => onCheckedChange?.(!checked)}
      className={cn(
        "relative inline-flex h-[28px] w-[50px] shrink-0 cursor-pointer rounded-full transition-all duration-300 ease-in-out focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        checked
          ? "bg-gradient-to-r from-cyan-500 to-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.5)]"
          : "bg-white/10 shadow-inner",
        className
      )}
    >
      <span
        className={cn(
          "absolute top-[3px] left-[3px] h-[22px] w-[22px] rounded-full bg-white shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-transform duration-300 ease-in-out",
          checked && "translate-x-[22px]"
        )}
      />
    </button>
  )
}

export { Switch }

