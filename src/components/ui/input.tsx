import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode
  endAction?: React.ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, endAction, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <div className="absolute left-3.5 text-muted-foreground pointer-events-none flex items-center justify-center">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-xl border border-input bg-background/80 px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 backdrop-blur-sm",
            icon && "pl-11",
            endAction && "pr-11",
            className
          )}
          ref={ref}
          {...props}
        />
        {endAction && (
          <div className="absolute right-3.5 flex items-center justify-center">
            {endAction}
          </div>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
