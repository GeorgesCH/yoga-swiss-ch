import { useState } from 'react';
import { useAuth } from './auth/ProductionAuthProvider';
import { useMultiTenantAuth } from './auth/MultiTenantAuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  UserCog,
  Bell,
  CreditCard,
  Shield,
  ChevronDown,
  Building2
} from 'lucide-react';
import { Badge } from './ui/badge';

interface UserAccountMenuProps {
  onPageChange?: (page: string) => void;
}

export function UserAccountMenu({ onPageChange }: UserAccountMenuProps) {
  const { user, signOut, loading } = useAuth();
  const { currentOrg, isOwnerOrManager } = useMultiTenantAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsSigningOut(false);
    }
  };

  const getInitials = (displayName?: string, email?: string) => {
    if (displayName) {
      return displayName.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.charAt(0).toUpperCase() + email.split('@')[0].charAt(1).toUpperCase();
    }
    return 'U';
  };

  const getUserDisplayName = () => {
    if (user?.profile?.display_name) return user.profile.display_name;
    if (user?.profile?.firstName && user?.profile?.lastName) {
      return `${user.profile.firstName} ${user.profile.lastName}`;
    }
    if (user?.user_metadata?.display_name) return user.user_metadata.display_name;
    if (user?.user_metadata?.firstName && user?.user_metadata?.lastName) {
      return `${user.user_metadata.firstName} ${user.user_metadata.lastName}`;
    }
    return user?.email?.split('@')[0] || 'User';
  };

  const getUserRole = () => {
    if (user?.profile?.role) return user.profile.role;
    if (user?.user_metadata?.role) return user.user_metadata.role;
    return 'User';
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'manager':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'instructor':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'staff':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading || !user) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
        <div className="h-4 w-16 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  const displayName = getUserDisplayName();
  const userRole = getUserRole();
  const initials = getInitials(displayName, user.email);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 hover:bg-muted/50">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.profile?.avatar_url || user.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="hidden md:block text-left">
              <div className="text-sm font-medium leading-none">{displayName}</div>
              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                {currentOrg && (
                  <>
                    <Building2 className="h-3 w-3" />
                    {currentOrg.name}
                  </>
                )}
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <Badge variant="secondary" className={`text-xs ${getRoleBadgeColor(userRole)}`}>
                {userRole}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
            {currentOrg && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <Building2 className="h-3 w-3" />
                <span>{currentOrg.name}</span>
                {isOwnerOrManager && (
                  <Badge variant="outline" className="text-xs ml-1">
                    Admin
                  </Badge>
                )}
              </div>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onPageChange?.('profile')}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPageChange?.('settings')}>
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          {isOwnerOrManager && (
            <DropdownMenuItem onClick={() => onPageChange?.('staff')}>
              <UserCog className="mr-2 h-4 w-4" />
              <span>Manage Staff</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={() => onPageChange?.('notifications')}>
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
            <Badge className="ml-auto h-5 w-5 p-0 text-xs bg-destructive">2</Badge>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPageChange?.('billing')}>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Billing</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onPageChange?.('security')}>
            <Shield className="mr-2 h-4 w-4" />
            <span>Security</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onPageChange?.('help')}>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="text-destructive focus:text-destructive focus:bg-destructive/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}