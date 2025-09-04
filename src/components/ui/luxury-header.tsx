import * as React from "react"
import { cn } from "./utils"
import { LuxuryButton } from "./luxury-button"
import { LuxuryBadge } from "./luxury-badge"
import { 
  Search, 
  MapPin, 
  Globe, 
  User, 
  Menu,
  Bell,
  Heart,
  Calendar,
  CreditCard
} from "lucide-react"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "./navigation-menu"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar"
import { Button } from "./button"

interface LuxuryHeaderProps {
  currentCity?: string
  currentLocale?: string
  isAuthenticated?: boolean
  user?: {
    name: string
    email: string
    avatar?: string
  }
  onCityChange?: (city: string) => void
  onLocaleChange?: (locale: string) => void
  onSignIn?: () => void
  onSignOut?: () => void
  className?: string
}

const cities = [
  { code: "ZUR", name: "Zürich" },
  { code: "GEN", name: "Geneva" },
  { code: "BSL", name: "Basel" },
  { code: "BRN", name: "Bern" },
  { code: "LAU", name: "Lausanne" },
]

const locales = [
  { code: "de-CH", name: "Deutsch", flag: "🇩🇪" },
  { code: "fr-CH", name: "Français", flag: "🇫🇷" },
  { code: "it-CH", name: "Italiano", flag: "🇮🇹" },
  { code: "en", name: "English", flag: "🇬🇧" },
]

export const LuxuryHeader = React.forwardRef<HTMLHeaderElement, LuxuryHeaderProps>(
  ({
    currentCity = "ZUR",
    currentLocale = "en",
    isAuthenticated = false,
    user,
    onCityChange,
    onLocaleChange,
    onSignIn,
    onSignOut,
    className,
    ...props
  }, ref) => {
    const [isSearchFocused, setIsSearchFocused] = React.useState(false)

    return (
      <header
        ref={ref}
        className={cn(
          "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80",
          className
        )}
        {...props}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-forest to-forest-light flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">YS</span>
              </div>
              <div className="hidden sm:block">
                <h1 className="font-serif text-xl font-bold text-foreground">YogaSwiss</h1>
                <p className="text-xs text-muted-foreground -mt-1">Premium Studio Platform</p>
              </div>
            </div>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div 
                className={cn(
                  "relative w-full transition-all duration-200",
                  isSearchFocused && "scale-105"
                )}
              >
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search classes, instructors, studios..."
                  className="w-full h-10 pl-10 pr-4 rounded-full border border-border bg-muted/30 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent focus:bg-background"
                  onFocus={() => setIsSearchFocused(true)}
                  onBlur={() => setIsSearchFocused(false)}
                />
              </div>
            </div>

            {/* Navigation & Actions */}
            <div className="flex items-center gap-4">
              {/* City Selector */}
              <div className="hidden lg:flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <select
                  value={currentCity}
                  onChange={(e) => onCityChange?.(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:outline-none cursor-pointer"
                >
                  {cities.map((city) => (
                    <option key={city.code} value={city.code}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language Selector */}
              <div className="hidden lg:flex items-center gap-2">
                <Globe className="w-4 h-4 text-muted-foreground" />
                <select
                  value={currentLocale}
                  onChange={(e) => onLocaleChange?.(e.target.value)}
                  className="bg-transparent border-none text-sm font-medium focus:outline-none cursor-pointer"
                >
                  {locales.map((locale) => (
                    <option key={locale.code} value={locale.code}>
                      {locale.flag} {locale.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* User Section */}
              {isAuthenticated && user ? (
                <div className="flex items-center gap-3">
                  {/* Notifications */}
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-4 h-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  </Button>

                  {/* Favorites */}
                  <Button variant="ghost" size="icon">
                    <Heart className="w-4 h-4" />
                  </Button>

                  {/* Profile Menu */}
                  <NavigationMenu>
                    <NavigationMenuList>
                      <NavigationMenuItem>
                        <NavigationMenuTrigger className="p-1 rounded-full">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <div className="w-80 p-4 space-y-4">
                            <div className="flex items-center gap-3 pb-3 border-b">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {user.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{user.name}</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <NavigationMenuLink asChild>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-muted transition-colors">
                                  <Calendar className="w-4 h-4" />
                                  My Bookings
                                </button>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-muted transition-colors">
                                  <CreditCard className="w-4 h-4" />
                                  Wallet & Passes
                                </button>
                              </NavigationMenuLink>
                              <NavigationMenuLink asChild>
                                <button className="w-full flex items-center gap-3 px-3 py-2 text-left rounded-md hover:bg-muted transition-colors">
                                  <User className="w-4 h-4" />
                                  Profile Settings
                                </button>
                              </NavigationMenuLink>
                            </div>

                            <div className="pt-3 border-t">
                              <LuxuryButton
                                variant="outline"
                                size="sm"
                                onClick={onSignOut}
                                className="w-full"
                              >
                                Sign Out
                              </LuxuryButton>
                            </div>
                          </div>
                        </NavigationMenuContent>
                      </NavigationMenuItem>
                    </NavigationMenuList>
                  </NavigationMenu>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LuxuryButton variant="ghost" size="sm" onClick={onSignIn}>
                    Sign In
                  </LuxuryButton>
                  <LuxuryButton variant="elegant" size="sm" onClick={onSignIn}>
                    Get Started
                  </LuxuryButton>
                </div>
              )}

              {/* Mobile Menu */}
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>
    )
  }
)

LuxuryHeader.displayName = "LuxuryHeader"

export default LuxuryHeader