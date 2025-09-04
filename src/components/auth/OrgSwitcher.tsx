import React from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '../ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { 
  Building, 
  ChevronDown, 
  Check, 
  Plus, 
  Settings, 
  LogOut,
  Crown,
  Users,
  User,
  CreditCard,
  Shield,
  Briefcase
} from 'lucide-react';
import { useAuth } from './AuthProvider';

const roleIcons = {
  owner: Crown,
  manager: Briefcase,
  instructor: User,
  front_desk: Users,
  accountant: CreditCard,
  marketer: Users
};

const roleLabels = {
  owner: 'Owner',
  manager: 'Manager', 
  instructor: 'Instructor',
  front_desk: 'Front Desk',
  accountant: 'Accountant',
  marketer: 'Marketer'
};

const statusColors = {
  active: 'bg-green-100 text-green-700 border-green-200',
  setup_incomplete: 'bg-orange-100 text-orange-700 border-orange-200',
  suspended: 'bg-red-100 text-red-700 border-red-200'
};

export function OrgSwitcher() {
  const { currentOrg, userOrgs, switchOrg, signOut } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [showCreateOrg, setShowCreateOrg] = React.useState(false);

  if (!currentOrg || userOrgs.length === 0) {
    return null;
  }

  const handleOrgSwitch = async (orgId: string) => {
    await switchOrg(orgId);
    setOpen(false);
  };

  const getOrgInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: string) => {
    const IconComponent = roleIcons[role as keyof typeof roleIcons] || User;
    return <IconComponent className="h-3 w-3" />;
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            role="combobox" 
            aria-expanded={open}
            className="w-[280px] justify-between"
          >
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getOrgInitials(currentOrg.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start">
                <span className="text-sm font-medium">{currentOrg.name}</span>
                <div className="flex items-center gap-1">
                  {getRoleIcon(currentOrg.role)}
                  <span className="text-xs text-muted-foreground">
                    {roleLabels[currentOrg.role]}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[280px] p-0">
          <Command>
            <CommandEmpty>No organizations found.</CommandEmpty>
            <CommandGroup heading="Your Organizations">
              <CommandList>
                {userOrgs.map((org) => (
                  <CommandItem
                    key={org.id}
                    value={org.id}
                    onSelect={() => handleOrgSwitch(org.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {getOrgInitials(org.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{org.name}</span>
                        <div className="flex items-center gap-1">
                          {getRoleIcon(org.role)}
                          <span className="text-xs text-muted-foreground">
                            {roleLabels[org.role]}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {org.status !== 'active' && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${statusColors[org.status]}`}
                        >
                          {org.status.replace('_', ' ')}
                        </Badge>
                      )}
                      {currentOrg.id === org.id && (
                        <Check className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </CommandGroup>
            
            <div className="border-t p-1">
              <CommandItem onSelect={() => setShowCreateOrg(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create New Studio
              </CommandItem>
            </div>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Create Organization Dialog */}
      <Dialog open={showCreateOrg} onOpenChange={setShowCreateOrg}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Studio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Create a new studio organization. You'll be the owner and can invite team members.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">Studio Owner</span>
              </div>
              <p className="text-sm text-blue-700">
                As a studio owner, you'll have full control over settings, team, customers, and finances.
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateOrg(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // In real implementation, this would redirect to studio creation flow
                console.log('Create new studio');
                setShowCreateOrg(false);
              }}>
                Get Started
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function UserMenu() {
  const { user, signOut } = useAuth();

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>
              {user.email?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user.profile?.display_name || 'User'}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Shield className="mr-2 h-4 w-4" />
          <span>Privacy</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={signOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}