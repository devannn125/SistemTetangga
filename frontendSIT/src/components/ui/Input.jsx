import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, prefixIcon, ...props }, ref) => {
  return (
    <div className={cn("relative w-full", className)}>
      {prefixIcon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {prefixIcon}
        </span>
      )}
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          prefixIcon && "pl-9"
        )}
        ref={ref}
        {...props} />
    </div>
  );
})
Input.displayName = "Input"

export { Input }
