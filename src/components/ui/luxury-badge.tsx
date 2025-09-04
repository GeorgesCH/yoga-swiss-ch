import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const luxuryBadgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground border-border",
        success: "border-transparent bg-emerald-100 text-emerald-800",
        warning: "border-transparent bg-amber-100 text-amber-800",
        danger: "border-transparent bg-red-100 text-red-800",
        level: "border-transparent bg-[var(--lake)]/10 text-[var(--lake)] border-[var(--lake)]/20",
        style: "border-transparent bg-[var(--forest)]/10 text-[var(--forest)] border-[var(--forest)]/20",
        outdoor: "border-transparent bg-emerald-50 text-emerald-700 border-emerald-200",
        signature: "border-[var(--champagne)] bg-[var(--champagne)]/20 text-[var(--forest)] font-semibold",
        swiss: "border-[var(--forest)]/20 bg-[var(--champagne)]/30 text-[var(--forest)] font-medium",
      },
      size: {
        sm: "px-2 py-0.5 text-xs",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface LuxuryBadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof luxuryBadgeVariants> {}

function LuxuryBadge({ className, variant, size, ...props }: LuxuryBadgeProps) {
  return (
    <div className={cn(luxuryBadgeVariants({ variant, size }), className)} {...props} />
  )
}

// Specific badge types for yoga content
const ClassTypeBadge = ({ type, ...props }: { type: string } & Omit<LuxuryBadgeProps, 'variant'>) => {
  const getVariant = (type: string) => {
    switch (type.toLowerCase()) {
      case 'vinyasa':
      case 'flow':
        return 'style'
      case 'hatha':
      case 'yin':
        return 'level'
      case 'outdoor':
      case 'nature':
        return 'outdoor'
      case 'retreat':
      case 'workshop':
        return 'signature'
      default:
        return 'default'
    }
  }

  return <LuxuryBadge variant={getVariant(type)} {...props}>{type}</LuxuryBadge>
}

const LevelBadge = ({ level, ...props }: { level: string } & Omit<LuxuryBadgeProps, 'variant'>) => (
  <LuxuryBadge variant="level" {...props}>{level}</LuxuryBadge>
)

const SwissBadge = ({ children, ...props }: { children: React.ReactNode } & Omit<LuxuryBadgeProps, 'variant'>) => (
  <LuxuryBadge variant="swiss" {...props}>
    <span className="mr-1">🇨🇭</span>
    {children}
  </LuxuryBadge>
)

export { LuxuryBadge, luxuryBadgeVariants, ClassTypeBadge, LevelBadge, SwissBadge }