import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const luxuryButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "luxury-button-primary shadow-lg hover:shadow-xl",
        secondary: "bg-secondary text-secondary-foreground hover:opacity-90 border border-border shadow-sm hover:shadow-md",
        outline: "border border-primary text-primary bg-background hover:bg-primary hover:text-primary-foreground shadow-sm hover:shadow-md",
        ghost: "text-foreground hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        elegant: "luxury-button-primary shadow-lg hover:shadow-xl transform hover:scale-[0.98]",
        luxury: "bg-[var(--champagne)] text-[var(--forest)] border border-[var(--forest)]/20 shadow-md hover:shadow-lg hover:bg-[var(--champagne-dark)]",
      },
      size: {
        sm: "h-9 rounded-md px-3 text-sm",
        md: "h-10 rounded-md px-4 py-2",
        lg: "h-11 rounded-lg px-6 text-base",
        xl: "h-12 rounded-lg px-8 text-lg",
        icon: "h-10 w-10 rounded-md",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
)

export interface LuxuryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof luxuryButtonVariants> {
  asChild?: boolean
}

const LuxuryButton = React.forwardRef<HTMLButtonElement, LuxuryButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(luxuryButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
LuxuryButton.displayName = "LuxuryButton"

export { LuxuryButton, luxuryButtonVariants }