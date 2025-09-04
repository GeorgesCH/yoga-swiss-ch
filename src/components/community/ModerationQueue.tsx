import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  Flag, 
  Shield, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  MoreHorizontal,
  Ban,
  Trash2,
  Edit,
  FileText
} from 'lucide-react';
import { supabase } from '../../utils/supabase/client';

// Safe import with fallback
let useMultiTenantAuth: any;
try {
  const authModule = require('../auth/MultiTenantAuthProvider');
  useMultiTenantAuth = authModule.useMultiTenantAuth;
} catch (error) {
  // Fallback implementation
  useMultiTenantAuth = () => ({ 
    currentOrg: { id: 'demo-org' }, 
    currentUser: { id: 'demo-user' } 
  });
}

interface ModerationItem {
  id: string;
  organization_id: string;
  message_id: string;
  reason: string;
  state: 'pending' | 'approved' | 'rejected';
  reporter_id: string;
  reviewed_by?: string;
  reviewed_at?: string;
  notes?: string;
  created_at: string;
  message: {
    id: string;
    body: string;
    sender_id: string;
    thread_id: string;
    created_at: string;
    sender: {
      display_name: string;
      avatar_url?: string;
    };
    thread: {
      title: string;
      type: string;
    };
  };
  reporter: {
    display_name: string;
    avatar_url?: string;
  };
  reviewer?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface ModerationStats {
  total_pending: number;
  total_reviewed_today: number;
  total_flagged_messages: number;
  average_review_time_hours: number;
}

export function ModerationQueue() {
  const { currentOrg, currentUser } = useMultiTenantAuth();
  const [items, setItems] = useState<ModerationItem[]>([]);
  const [stats, setStats] = useState<ModerationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterState, setFilterState] = useState<string>('pending');
  const [selectedItem, setSelectedItem] = useState<ModerationItem | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (currentOrg?.id) {
      loadModerationItems();
      loadModerationStats();
    }
  }, [currentOrg, filterState]);

  const loadModerationItems = async () => {
    if (!currentOrg?.id) return;

    try {
      setLoading(true);

      // Use our community server endpoint
      const response = await fetch(`/functions/v1/make-server-f0b2daa4/community/moderation/${currentOrg.id}?state=${filterState}`, {
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'demo-key'}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch moderation items');
      }

      const data = await response.json();
      setItems(data.items || []);

    } catch (error) {
      console.error('Error loading moderation items:', error);
      // Fallback demo data for pending items
      if (filterState === 'pending') {
        setItems([
          {
            id: 'demo-mod-1',
            message_id: 'demo-msg-1',
            reason: 'inappropriate',
            state: 'pending',
            reporter_id: 'demo-user-1',
            created_at: new Date().toISOString(),
            message: {
              id: 'demo-msg-1',
              body: 'This is a sample flagged message that needs moderation review.',
              sender_id: 'demo-user-2',
              thread_id: 'demo-thread-1',
              created_at: new Date(Date.now() - 3600000).toISOString(),
              sender: { display_name: 'Sample User', avatar_url: null },
              thread: { title: 'General Discussion', type: 'discussion' }
            },
            reporter: { display_name: 'Reporter User', avatar_url: null }
          }
        ]);
      } else {
        setItems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadModerationStats = async () => {
    if (!currentOrg?.id) return;

    try {
      // Demo stats for yoga studio
      setStats({
        total_pending: 1,
        total_reviewed_today: 3,
        total_flagged_messages: 2,
        average_review_time_hours: 1.2
      });
    } catch (error) {
      console.error('Error loading moderation stats:', error);
    }
  };

  const reviewItem = async (itemId: string, action: 'approved' | 'rejected', notes?: string) => {
    try {
      setProcessing(true);

      // Use our community server endpoint
      const response = await fetch(`/functions/v1/make-server-f0b2daa4/community/moderation/${itemId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_ANON_KEY || 'demo-key'}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          state: action,
          reviewer_id: currentUser?.id || 'demo-user',
          notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to review item');
      }

      setSelectedItem(null);
      setReviewNotes('');
      loadModerationItems();
      loadModerationStats();

    } catch (error) {
      console.error('Error reviewing item:', error);
      // For demo, just update local state
      setSelectedItem(null);
      setReviewNotes('');
      setItems(prev => prev.filter(item => item.id !== itemId));
      loadModerationStats();
    } finally {
      setProcessing(false);
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason.toLowerCase()) {
      case 'spam':
        return 'bg-orange-100 text-orange-700';
      case 'inappropriate':
        return 'bg-red-100 text-red-700';
      case 'harassment':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStateIcon = (state: string) => {
    switch (state) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading moderation queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Moderation Queue
          </h1>
          <p className="text-muted-foreground">
            Review and manage flagged messages and content
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending Review</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.total_pending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Reviewed Today</p>
                  <p className="text-2xl font-bold text-green-600">{stats.total_reviewed_today}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Flagged</p>
                  <p className="text-2xl font-bold text-red-600">{stats.total_flagged_messages}</p>
                </div>
                <Flag className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Review Time</p>
                  <p className="text-2xl font-bold">{stats.average_review_time_hours}h</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter Tabs */}
      <Tabs value={filterState} onValueChange={setFilterState}>
        <TabsList>
          <TabsTrigger value="pending">
            Pending {stats?.total_pending ? `(${stats.total_pending})` : ''}
          </TabsTrigger>
          <TabsTrigger value="approved">Approved</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="all">All Items</TabsTrigger>
        </TabsList>

        <TabsContent value={filterState} className="space-y-4">
          {items.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No items to review</h3>
                  <p className="text-muted-foreground">
                    {filterState === 'pending' 
                      ? 'All caught up! No pending moderation items.'
                      : `No ${filterState} items found.`
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Message Content */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getReasonColor(item.reason)}>
                            <Flag className="h-3 w-3 mr-1" />
                            {item.reason}
                          </Badge>
                          <div className="flex items-center gap-1">
                            {getStateIcon(item.state)}
                            <span className="text-sm font-medium capitalize">{item.state}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatTime(item.created_at)}
                          </span>
                        </div>

                        <div className="bg-muted p-4 rounded-lg mb-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={item.message.sender.avatar_url} />
                              <AvatarFallback>
                                {item.message.sender.display_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium text-sm">
                              {item.message.sender.display_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              in {item.message.thread.title}
                            </span>
                          </div>
                          <p className="text-sm">{item.message.body}</p>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>Reported by {item.reporter.display_name}</span>
                            </div>
                            {item.reviewer && (
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                <span>Reviewed by {item.reviewer.display_name}</span>
                              </div>
                            )}
                          </div>

                          {item.state === 'pending' && (
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedItem(item)}
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                Review
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => reviewItem(item.id, 'approved')}
                                disabled={processing}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => reviewItem(item.id, 'rejected')}
                                disabled={processing}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>

                        {item.notes && (
                          <div className="mt-3 p-3 bg-accent rounded border-l-4 border-primary">
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-4 w-4" />
                              <span className="font-medium text-sm">Review Notes</span>
                            </div>
                            <p className="text-sm text-muted-foreground">{item.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Flagged Content</DialogTitle>
            <DialogDescription>
              Review this flagged message and take appropriate action.
            </DialogDescription>
          </DialogHeader>

          {selectedItem && (
            <div className="space-y-6">
              {/* Message Details */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={getReasonColor(selectedItem.reason)}>
                    <Flag className="h-3 w-3 mr-1" />
                    {selectedItem.reason}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Reported {formatTime(selectedItem.created_at)}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={selectedItem.message.sender.avatar_url} />
                      <AvatarFallback>
                        {selectedItem.message.sender.display_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-sm">
                      {selectedItem.message.sender.display_name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      in {selectedItem.message.thread.title}
                    </span>
                  </div>
                  <p className="text-sm bg-background p-3 rounded border">
                    {selectedItem.message.body}
                  </p>
                </div>

                <div className="text-xs text-muted-foreground">
                  <span>Reported by {selectedItem.reporter.display_name}</span>
                  <span className="mx-2">•</span>
                  <span>Message sent {formatTime(selectedItem.message.created_at)}</span>
                </div>
              </div>

              {/* Review Notes */}
              <div>
                <label className="text-sm font-medium">Review Notes (Optional)</label>
                <Textarea
                  placeholder="Add notes about your decision..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedItem(null)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  onClick={() => reviewItem(selectedItem.id, 'approved', reviewNotes)}
                  disabled={processing}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve Message
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => reviewItem(selectedItem.id, 'rejected', reviewNotes)}
                  disabled={processing}
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject & Hide
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}