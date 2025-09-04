import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { 
  Shield, 
  Users, 
  Key, 
  Eye, 
  EyeOff, 
  Clock, 
  Lock, 
  Download, 
  Trash2, 
  Plus, 
  Edit,
  AlertTriangle,
  CheckCircle,
  UserPlus,
  Settings
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isCustom: boolean;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin: string;
  twoFactorEnabled: boolean;
}

export function SecuritySettings() {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: 'owner',
      name: 'Studio Owner',
      description: 'Full access to all features and settings',
      permissions: ['*'],
      userCount: 1,
      isCustom: false
    },
    {
      id: 'manager',
      name: 'Studio Manager',
      description: 'Manage classes, customers, and daily operations',
      permissions: ['classes.*', 'customers.*', 'registrations.*', 'reports.view'],
      userCount: 2,
      isCustom: false
    },
    {
      id: 'instructor',
      name: 'Instructor',
      description: 'Manage own classes and view student rosters',
      permissions: ['classes.own.*', 'rosters.view', 'customers.view'],
      userCount: 5,
      isCustom: false
    },
    {
      id: 'frontdesk',
      name: 'Front Desk',
      description: 'Handle registrations and customer service',
      permissions: ['registrations.*', 'customers.view', 'customers.edit', 'pos.*'],
      userCount: 3,
      isCustom: false
    }
  ]);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Mueller',
      email: 'sarah@yogazen.ch',
      role: 'owner',
      status: 'active',
      lastLogin: '2024-01-15 14:30',
      twoFactorEnabled: true
    },
    {
      id: '2',
      name: 'Marco Rossi',
      email: 'marco@yogazen.ch', 
      role: 'manager',
      status: 'active',
      lastLogin: '2024-01-15 09:15',
      twoFactorEnabled: true
    },
    {
      id: '3',
      name: 'Lisa Chen',
      email: 'lisa@yogazen.ch',
      role: 'instructor',
      status: 'active', 
      lastLogin: '2024-01-14 18:45',
      twoFactorEnabled: false
    }
  ]);

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);

  const allPermissions = [
    { category: 'Dashboard', permissions: ['dashboard.view', 'analytics.view'] },
    { category: 'Classes', permissions: ['classes.view', 'classes.create', 'classes.edit', 'classes.delete'] },
    { category: 'Customers', permissions: ['customers.view', 'customers.create', 'customers.edit', 'customers.delete', 'customers.export'] },
    { category: 'Registrations', permissions: ['registrations.view', 'registrations.create', 'registrations.edit', 'registrations.cancel'] },
    { category: 'Finance', permissions: ['finance.view', 'finance.reports', 'finance.payouts', 'finance.refunds'] },
    { category: 'Marketing', permissions: ['marketing.view', 'marketing.campaigns', 'marketing.analytics'] },
    { category: 'Settings', permissions: ['settings.view', 'settings.edit', 'settings.security'] },
    { category: 'POS', permissions: ['pos.access', 'pos.sales', 'pos.cash_drawer'] }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Inactive</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return <Badge variant="outline">Unknown</Badge>;
    
    switch (roleId) {
      case 'owner':
        return <Badge className="bg-purple-100 text-purple-800">{role.name}</Badge>;
      case 'manager':
        return <Badge className="bg-blue-100 text-blue-800">{role.name}</Badge>;
      case 'instructor':
        return <Badge className="bg-green-100 text-green-800">{role.name}</Badge>;
      default:
        return <Badge variant="secondary">{role.name}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2>Security & Access</h2>
          <p className="text-muted-foreground">
            Manage team members, roles, and security settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsRoleDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Role
          </Button>
          <Button onClick={() => setIsMemberDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </div>

      <Tabs defaultValue="team" className="space-y-6">
        <TabsList>
          <TabsTrigger value="team">Team Members</TabsTrigger>
          <TabsTrigger value="roles">Roles & Permissions</TabsTrigger>
          <TabsTrigger value="security">Security Policies</TabsTrigger>
          <TabsTrigger value="audit">Audit & Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="team" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage team member access and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Login</TableHead>
                    <TableHead>2FA</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getRoleBadge(member.role)}</TableCell>
                      <TableCell>{getStatusBadge(member.status)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {member.lastLogin}
                      </TableCell>
                      <TableCell>
                        {member.twoFactorEnabled ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {role.name}
                        {role.isCustom && <Badge variant="outline">Custom</Badge>}
                      </CardTitle>
                      <CardDescription>{role.description}</CardDescription>
                    </div>
                    {role.isCustom && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Users with this role</span>
                      <span className="font-medium">{role.userCount}</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-sm">Permissions</Label>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.length > 5 ? (
                          <>
                            {role.permissions.slice(0, 3).map((perm) => (
                              <Badge key={perm} variant="outline" className="text-xs">
                                {perm === '*' ? 'All Permissions' : perm.replace('.', ' ')}
                              </Badge>
                            ))}
                            <Badge variant="outline" className="text-xs">
                              +{role.permissions.length - 3} more
                            </Badge>
                          </>
                        ) : (
                          role.permissions.map((perm) => (
                            <Badge key={perm} variant="outline" className="text-xs">
                              {perm === '*' ? 'All Permissions' : perm.replace('.', ' ')}
                            </Badge>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Authentication & Security</CardTitle>
              <CardDescription>Configure security policies and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Require Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">Enforce 2FA for all team members</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enforce Strong Passwords</Label>
                    <p className="text-sm text-muted-foreground">Minimum 8 characters with mixed case and numbers</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Auto-logout Inactive Sessions</Label>
                    <p className="text-sm text-muted-foreground">Automatically log out users after inactivity</p>
                  </div>
                  <Select defaultValue="4h">
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="4h">4 hours</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
                      <SelectItem value="24h">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">IP Access Control</h4>
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Restrict Dashboard Access by IP</Label>
                    <p className="text-sm text-muted-foreground">Only allow access from specific IP addresses</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="allowed-ips">Allowed IP Addresses</Label>
                  <Input 
                    id="allowed-ips" 
                    placeholder="192.168.1.100, 10.0.0.0/24" 
                    disabled 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Data Access Controls</CardTitle>
              <CardDescription>Configure data visibility and export permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Mask Customer Data by Default</Label>
                  <p className="text-sm text-muted-foreground">Hide sensitive customer information for certain roles</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Approval for Data Exports</Label>
                  <p className="text-sm text-muted-foreground">Manager approval required for customer data exports</p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Log All Data Access</Label>
                  <p className="text-sm text-muted-foreground">Track when sensitive data is viewed or exported</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Monitor and track all system activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-sm text-muted-foreground">Actions logged today</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">15</div>
                    <div className="text-sm text-muted-foreground">Failed login attempts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">3</div>
                    <div className="text-sm text-muted-foreground">Data exports this week</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Recent Security Events</h4>
                  {[
                    { time: '14:30', user: 'sarah@yogazen.ch', action: 'Exported customer data', risk: 'medium' },
                    { time: '09:15', user: 'marco@yogazen.ch', action: 'Changed user role permissions', risk: 'high' },
                    { time: '08:45', user: 'lisa@yogazen.ch', action: 'Failed login attempt', risk: 'low' },
                  ].map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{event.action}</p>
                        <p className="text-sm text-muted-foreground">{event.user} • {event.time}</p>
                      </div>
                      <Badge 
                        variant={event.risk === 'high' ? 'destructive' : event.risk === 'medium' ? 'default' : 'secondary'}
                      >
                        {event.risk} risk
                      </Badge>
                    </div>
                  ))}
                </div>

                <div className="pt-4">
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Audit Log
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Compliance Settings</CardTitle>
              <CardDescription>GDPR and Swiss data protection compliance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <Select defaultValue="7years">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1year">1 year</SelectItem>
                      <SelectItem value="3years">3 years</SelectItem>
                      <SelectItem value="7years">7 years</SelectItem>
                      <SelectItem value="indefinite">Indefinite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anonymization-delay">Anonymization Delay</Label>
                  <Select defaultValue="30days">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="30days">30 days</SelectItem>
                      <SelectItem value="90days">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-purge Inactive Customers</Label>
                  <p className="text-sm text-muted-foreground">Automatically remove data for customers inactive over retention period</p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Consent Version Tracking</Label>
                  <p className="text-sm text-muted-foreground">Track privacy policy and consent versions</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invite Member Dialog */}
      <Dialog open={isMemberDialogOpen} onOpenChange={setIsMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to join your studio team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invite-name">Full Name</Label>
                <Input id="invite-name" placeholder="Enter full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invite-email">Email Address</Label>
                <Input id="invite-email" type="email" placeholder="Enter email" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="invite-role">Role</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsMemberDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsMemberDialogOpen(false)}>
                Send Invitation
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}