import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const luxuryCardVariants = cva(
  "rounded-lg border bg-card text-card-foreground transition-all duration-220",
  {
    variants: {
      variant: {
        default: "shadow-sm hover:shadow-md",
        elevated: "shadow-md hover:shadow-lg",
        premium: "shadow-lg hover:shadow-xl border-2",
        floating: "shadow-xl hover:shadow-2xl transform hover:-translate-y-1",
        minimal: "border-0 shadow-none bg-transparent",
      },
      padding: {
        none: "p-0",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
        xl: "p-10",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

export interface LuxuryCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof luxuryCardVariants> {}

const LuxuryCard = React.forwardRef<HTMLDivElement, LuxuryCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(luxuryCardVariants({ variant, padding }), className)}
      {...props}
    />
  )
)
LuxuryCard.displayName = "LuxuryCard"

const LuxuryCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5", className)}
    {...props}
  />
))
LuxuryCardHeader.displayName = "LuxuryCardHeader"

const LuxuryCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-serif text-2xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
LuxuryCardTitle.displayName = "LuxuryCardTitle"

const LuxuryCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground leading-relaxed", className)}
    {...props}
  />
))
LuxuryCardDescription.displayName = "LuxuryCardDescription"

const LuxuryCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
))
LuxuryCardContent.displayName = "LuxuryCardContent"

const LuxuryCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
LuxuryCardFooter.displayName = "LuxuryCardFooter"

export {
  LuxuryCard,
  LuxuryCardHeader,
  LuxuryCardFooter,
  LuxuryCardTitle,
  LuxuryCardDescription,
  LuxuryCardContent,
}