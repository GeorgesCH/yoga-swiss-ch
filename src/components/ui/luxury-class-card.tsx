import * as React from "react"
import { cn } from "./utils"
import { LuxuryCard, LuxuryCardContent, LuxuryCardHeader } from "./luxury-card"
import { LuxuryButton } from "./luxury-button"
import { ClassTypeBadge, LevelBadge, LuxuryBadge } from "./luxury-badge"
import { MapPin, Clock, Users, Heart, Star } from "lucide-react"
import { ImageWithFallback } from "../figma/ImageWithFallback"

interface LuxuryClassCardProps {
  id: string
  title: string
  instructor: string
  type: string
  level: string
  duration: number
  time: string
  date: string
  location: string
  price: number
  currency?: string
  spotsLeft?: number
  isOutdoor?: boolean
  isSignature?: boolean
  isSwiss?: boolean
  image?: string
  rating?: number
  isFavorite?: boolean
  onBook?: () => void
  onFavorite?: () => void
  className?: string
}

export const LuxuryClassCard = React.forwardRef<HTMLDivElement, LuxuryClassCardProps>(
  ({
    id,
    title,
    instructor,
    type,
    level,
    duration,
    time,
    date,
    location,
    price,
    currency = "CHF",
    spotsLeft,
    isOutdoor = false,
    isSignature = false,
    isSwiss = false,
    image,
    rating,
    isFavorite = false,
    onBook,
    onFavorite,
    className,
    ...props
  }, ref) => {
    const formatPrice = (amount: number, curr: string) => {
      return new Intl.NumberFormat('de-CH', {
        style: 'currency',
        currency: curr,
        minimumFractionDigits: 0
      }).format(amount)
    }

    const getSpotsColor = (spots?: number) => {
      if (!spots) return "success"
      if (spots <= 3) return "danger"
      if (spots <= 6) return "warning"
      return "success"
    }

    return (
      <LuxuryCard
        ref={ref}
        variant="elevated"
        padding="none"
        className={cn(
          "group overflow-hidden hover:scale-[1.02] transition-all duration-220",
          isSignature && "border-champagne shadow-lg",
          className
        )}
        {...props}
      >
        {/* Image Header */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {image ? (
            <ImageWithFallback
              src={image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
              <div className="text-muted-foreground text-4xl">🧘‍♀️</div>
            </div>
          )}
          
          {/* Floating badges */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-2">
            <ClassTypeBadge type={type} size="sm" />
            {isOutdoor && <LuxuryBadge variant="outdoor" size="sm">Outdoor</LuxuryBadge>}
            {isSignature && <LuxuryBadge variant="signature" size="sm">Signature</LuxuryBadge>}
            {isSwiss && (
              <LuxuryBadge variant="swiss" size="sm">
                <span className="mr-1">🇨🇭</span>
                Swiss
              </LuxuryBadge>
            )}
          </div>

          {/* Favorite button */}
          <button
            onClick={onFavorite}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-all duration-150"
          >
            <Heart 
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"
              )}
            />
          </button>

          {/* Price overlay */}
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 shadow-sm">
            <div className="luxury-price text-lg font-semibold text-forest">
              <span className="currency text-sm mr-0.5">{currency}</span>
              {price}
            </div>
          </div>
        </div>

        {/* Content */}
        <LuxuryCardContent className="p-6">
          <LuxuryCardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-1 leading-tight">
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground font-medium">
                  with {instructor}
                </p>
              </div>
              {rating && (
                <div className="flex items-center gap-1 text-sm">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </LuxuryCardHeader>

          {/* Meta information */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{time}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-medium">{duration}min</span>
              </div>
              <LevelBadge level={level} size="sm" />
            </div>

            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span>{location}</span>
            </div>

            {spotsLeft !== undefined && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <LuxuryBadge variant={getSpotsColor(spotsLeft)} size="sm">
                  {spotsLeft > 0 ? `${spotsLeft} spots left` : "Waitlist only"}
                </LuxuryBadge>
              </div>
            )}
          </div>

          {/* Book button */}
          <LuxuryButton
            onClick={onBook}
            variant={isSignature ? "elegant" : "primary"}
            size="lg"
            className="w-full"
            disabled={spotsLeft === 0}
          >
            {spotsLeft === 0 ? "Join Waitlist" : "Book Now"}
          </LuxuryButton>
        </LuxuryCardContent>
      </LuxuryCard>
    )
  }
)

LuxuryClassCard.displayName = "LuxuryClassCard"

export default LuxuryClassCard