import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glow" | "success"
  size?: "default" | "sm" | "lg" | "icon"
  isLoading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", isLoading = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none"

    const variants = {
      default:
        "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/25 hover:from-indigo-500 hover:to-purple-500 hover:shadow-lg hover:shadow-indigo-500/35",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/50",
      destructive:
        "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
      outline:
        "border border-input bg-background/60 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground hover:border-accent",
      ghost:
        "hover:bg-accent hover:text-accent-foreground",
      link:
        "text-primary underline-offset-4 hover:underline",
      glow:
        "bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] hover:shadow-[0_0_25px_rgba(99,102,241,0.7)] hover:bg-indigo-500",
      success:
        "bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-500"
    }

    const sizes = {
      default: "h-10 px-4 py-2 gap-2",
      sm: "h-8 rounded-lg px-3 text-xs gap-1.5",
      lg: "h-11 rounded-xl px-6 text-base gap-2.5",
      icon: "h-10 w-10 p-0"
    }

    return (
      <button
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            ></path>
          </svg>
        )}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"

export { Button }
