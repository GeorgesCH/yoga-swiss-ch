import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { 
  MessageSquare, 
  Send, 
  Plus, 
  Users, 
  Settings, 
  Search, 
  Filter,
  Flag,
  MoreHorizontal,
  Paperclip,
  Smile,
  AtSign,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  Lock,
  Volume2,
  VolumeX,
  Pin,
  Archive,
  Trash2,
  Reply,
  Edit,
  Forward
} from 'lucide-react';

interface Thread {
  id: string;
  organization_id: string;
  type: 'direct' | 'class' | 'retreat' | 'announcement' | 'support';
  title: string;
  context_id?: string;
  created_by: string;
  visibility: 'org' | 'roster' | 'staff' | 'private';
  locked: boolean;
  archived: boolean;
  message_count: number;
  last_message_at: string;
  members?: ThreadMember[];
  last_message?: Message;
}

interface ThreadMember {
  id: string;
  user_id: string;
  role: 'owner' | 'moderator' | 'member';
  joined_at: string;
  last_read_at: string;
  muted: boolean;
  notifications_enabled: boolean;
  user?: {
    display_name: string;
    avatar_url?: string;
  };
}

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  body_html?: string;
  attachments: any[];
  reply_to_id?: string;
  edited_at?: string;
  deleted_at?: string;
  flagged: boolean;
  flag_reason?: string;
  created_at: string;
  sender?: {
    display_name: string;
    avatar_url?: string;
  };
  reply_to?: Message;
}

interface MessageTemplate {
  id: string;
  name: string;
  category: string;
  subject?: string;
  body: string;
  variables: string[];
}

export function SafeCommunityMessaging() {
  // Safe fallback for auth context
  const currentOrg = { id: 'demo-org', name: 'Demo Studio' };
  const currentUser = { id: 'demo-user', name: 'Demo User' };

  const [threads, setThreads] = useState<Thread[]>([]);
  const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadThreads();
    loadTemplates();
    loadUnreadCount();
  }, []);

  useEffect(() => {
    if (selectedThread) {
      loadMessages(selectedThread.id);
      markThreadAsRead(selectedThread.id);
    }
  }, [selectedThread]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadThreads = async () => {
    try {
      setLoading(true);

      // Demo data for yoga studio
      const demoThreads: Thread[] = [
        {
          id: 'thread-1',
          organization_id: currentOrg.id,
          type: 'class',
          title: 'Morning Hatha Yoga Class',
          created_by: 'instructor-1',
          visibility: 'roster',
          locked: false,
          archived: false,
          message_count: 8,
          last_message_at: new Date().toISOString(),
          members: [
            { 
              id: 'member-1', 
              user_id: currentUser.id, 
              role: 'member',
              joined_at: new Date().toISOString(),
              last_read_at: new Date(Date.now() - 3600000).toISOString(),
              muted: false,
              notifications_enabled: true
            }
          ]
        },
        {
          id: 'thread-2',
          organization_id: currentOrg.id,
          type: 'announcement',
          title: 'Studio Updates & Events',
          created_by: 'manager-1',
          visibility: 'org',
          locked: false,
          archived: false,
          message_count: 15,
          last_message_at: new Date(Date.now() - 1800000).toISOString(),
          members: [
            { 
              id: 'member-2', 
              user_id: currentUser.id, 
              role: 'member',
              joined_at: new Date().toISOString(),
              last_read_at: new Date().toISOString(),
              muted: false,
              notifications_enabled: true
            }
          ]
        },
        {
          id: 'thread-3',
          organization_id: currentOrg.id,
          type: 'retreat',
          title: 'Alpine Yoga Retreat Discussion',
          created_by: 'instructor-2',
          visibility: 'roster',
          locked: false,
          archived: false,
          message_count: 22,
          last_message_at: new Date(Date.now() - 7200000).toISOString(),
          members: [
            { 
              id: 'member-3', 
              user_id: currentUser.id, 
              role: 'member',
              joined_at: new Date().toISOString(),
              last_read_at: new Date(Date.now() - 3600000).toISOString(),
              muted: false,
              notifications_enabled: true
            }
          ]
        }
      ];

      setThreads(demoThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    try {
      // Demo messages based on thread type
      const demoMessages: Message[] = threadId === 'thread-1' ? [
        {
          id: 'msg-1',
          thread_id: threadId,
          sender_id: 'instructor-1',
          body: 'Namaste everyone! 🙏 Welcome to our morning Hatha yoga class discussion. Please feel free to share any questions about today\'s practice or upcoming sessions.',
          created_at: new Date(Date.now() - 86400000).toISOString(),
          sender: { display_name: 'Sarah (Instructor)', avatar_url: null },
          attachments: [],
          flagged: false
        },
        {
          id: 'msg-2',
          thread_id: threadId,
          sender_id: 'student-1',
          body: 'Thank you Sarah! I really enjoyed the breathing exercises today. Could you recommend some pranayama practices for home?',
          created_at: new Date(Date.now() - 43200000).toISOString(),
          sender: { display_name: 'Emma (Student)', avatar_url: null },
          attachments: [],
          flagged: false
        },
        {
          id: 'msg-3',
          thread_id: threadId,
          sender_id: 'instructor-1',
          body: 'Absolutely Emma! I\'ll share a simple 4-7-8 breathing technique that\'s perfect for beginners. Practice it for 5 minutes each morning. 🌅',
          created_at: new Date(Date.now() - 21600000).toISOString(),
          sender: { display_name: 'Sarah (Instructor)', avatar_url: null },
          attachments: [],
          flagged: false
        }
      ] : [
        {
          id: 'msg-4',
          thread_id: threadId,
          sender_id: 'manager-1',
          body: 'Hello everyone! 🌟 We have some exciting updates to share about our upcoming workshops and new class schedules.',
          created_at: new Date(Date.now() - 7200000).toISOString(),
          sender: { display_name: 'Studio Manager', avatar_url: null },
          attachments: [],
          flagged: false
        }
      ];

      setMessages(demoMessages);
      setTimeout(scrollToBottom, 100);

    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      // Yoga-specific message templates
      const yogaTemplates: MessageTemplate[] = [
        {
          id: 'welcome-student',
          name: 'Welcome New Student',
          category: 'Welcome',
          subject: 'Welcome to YogaSwiss!',
          body: 'Namaste! 🙏 Welcome to our yoga community. We\'re excited to have you join us on this beautiful journey. If you have any questions about classes, poses, or our studio, please don\'t hesitate to ask. Let\'s breathe and grow together!',
          variables: ['student_name', 'studio_name']
        },
        {
          id: 'class-reminder',
          name: 'Class Reminder',
          category: 'Classes',
          subject: 'Your yoga class starts soon',
          body: 'Hi there! 🧘‍♀️ Just a gentle reminder that your {{class_name}} class starts in {{time_until}}. Please arrive 5-10 minutes early to settle in. Don\'t forget your mat and water bottle. See you on the mat!',
          variables: ['class_name', 'time_until', 'instructor_name']
        },
        {
          id: 'wellness-tip',
          name: 'Weekly Wellness Tip',
          category: 'Wellness',
          subject: 'Your weekly dose of wellness',
          body: 'Weekly Wisdom 🌟 This week, try incorporating {{tip_focus}} into your daily routine. {{tip_description}} Remember, small consistent steps lead to big transformations. Practice with intention, breathe with awareness.',
          variables: ['tip_focus', 'tip_description']
        }
      ];

      setTemplates(yogaTemplates);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadUnreadCount = async () => {
    try {
      setUnreadCount(2); // Demo unread count
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const markThreadAsRead = async (threadId: string) => {
    try {
      // Update local unread count
      setUnreadCount(Math.max(0, unreadCount - 1));
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  };

  const sendMessage = async () => {
    if (!selectedThread || !newMessage.trim() || sending) return;

    try {
      setSending(true);

      // Create optimistic message
      const optimisticMessage: Message = {
        id: `msg-${Date.now()}`,
        thread_id: selectedThread.id,
        sender_id: currentUser.id,
        body: newMessage.trim(),
        created_at: new Date().toISOString(),
        sender: { display_name: 'You', avatar_url: null },
        attachments: [],
        flagged: false
      };

      setMessages(prev => [...prev, optimisticMessage]);
      setNewMessage('');
      setTimeout(scrollToBottom, 100);

      // Update thread count
      const updatedThreads = threads.map(thread => 
        thread.id === selectedThread.id 
          ? { ...thread, message_count: thread.message_count + 1, last_message_at: new Date().toISOString() }
          : thread
      );
      setThreads(updatedThreads);

    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const createThread = async (type: string, title: string, memberIds: string[]) => {
    try {
      const newThread: Thread = {
        id: `thread-${Date.now()}`,
        organization_id: currentOrg.id,
        type: type as any,
        title,
        created_by: currentUser.id,
        visibility: 'org',
        locked: false,
        archived: false,
        message_count: 0,
        last_message_at: new Date().toISOString(),
        members: [
          {
            id: `member-${Date.now()}`,
            user_id: currentUser.id,
            role: 'owner',
            joined_at: new Date().toISOString(),
            last_read_at: new Date().toISOString(),
            muted: false,
            notifications_enabled: true
          }
        ]
      };

      setThreads(prev => [newThread, ...prev]);
      setShowCreateThread(false);
    } catch (error) {
      console.error('Error creating thread:', error);
    }
  };

  const flagMessage = async (messageId: string, reason: string) => {
    try {
      // Update message as flagged
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, flagged: true, flag_reason: reason }
            : msg
        )
      );
    } catch (error) {
      console.error('Error flagging message:', error);
    }
  };

  const filteredThreads = threads.filter(thread => {
    const matchesSearch = !searchQuery || 
      thread.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || thread.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getThreadIcon = (type: string) => {
    switch (type) {
      case 'class': return '🧘';
      case 'retreat': return '🏔️';
      case 'announcement': return '📢';
      case 'support': return '🛟';
      default: return '💬';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[800px] flex border rounded-lg overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 border-r bg-card flex flex-col">
        {/* Header */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages
              {unreadCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {unreadCount}
                </Badge>
              )}
            </h2>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowTemplates(true)}
              >
                <Settings className="h-4 w-4" />
              </Button>
              <Button 
                variant="default" 
                size="sm"
                onClick={() => setShowCreateThread(true)}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Conversations</SelectItem>
                <SelectItem value="direct">Direct Messages</SelectItem>
                <SelectItem value="class">Class Discussions</SelectItem>
                <SelectItem value="announcement">Announcements</SelectItem>
                <SelectItem value="retreat">Retreats</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Threads List */}
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {filteredThreads.map((thread) => {
              const hasUnread = thread.members?.some(
                member => member.user_id === currentUser?.id && 
                thread.last_message_at > member.last_read_at
              );

              return (
                <div
                  key={thread.id}
                  className={`p-3 rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                    selectedThread?.id === thread.id ? 'bg-accent' : ''
                  }`}
                  onClick={() => setSelectedThread(thread)}
                >
                  <div className="flex items-start gap-3">
                    <div className="text-lg">{getThreadIcon(thread.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium truncate ${
                          hasUnread ? 'font-semibold' : ''
                        }`}>
                          {thread.title}
                        </span>
                        {hasUnread && (
                          <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0"></div>
                        )}
                        {thread.locked && <Lock className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{thread.message_count} messages</span>
                        <span>•</span>
                        <span>{formatTime(thread.last_message_at)}</span>
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <Users className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {thread.members?.length || 0} members
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredThreads.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No conversations found</p>
                <p className="text-sm">Start a new conversation to get started</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedThread ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-xl">{getThreadIcon(selectedThread.type)}</div>
                  <div>
                    <h3 className="font-semibold">{selectedThread.title}</h3>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Users className="h-3 w-3" />
                      {selectedThread.members?.length || 0} members
                      {selectedThread.visibility !== 'private' && (
                        <>
                          <span>•</span>
                          <Eye className="h-3 w-3" />
                          <span className="capitalize">{selectedThread.visibility}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-3">
                    <Avatar className="h-8 w-8 flex-shrink-0">
                      <AvatarImage src={message.sender?.avatar_url} />
                      <AvatarFallback>
                        {message.sender?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">
                          {message.sender?.display_name || 'Unknown User'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(message.created_at)}
                        </span>
                        {message.edited_at && (
                          <span className="text-xs text-muted-foreground">(edited)</span>
                        )}
                        {message.flagged && (
                          <Flag className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                      
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="whitespace-pre-wrap">{message.body}</p>
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="flex items-center gap-2 text-sm">
                                <Paperclip className="h-3 w-3" />
                                <span>{attachment.name}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                          <Reply className="h-3 w-3 mr-1" />
                          Reply
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 px-2 text-xs"
                          onClick={() => flagMessage(message.id, 'inappropriate')}
                        >
                          <Flag className="h-3 w-3 mr-1" />
                          Flag
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t bg-card">
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="min-h-[60px] resize-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        sendMessage();
                      }
                    }}
                  />
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Smile className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <AtSign className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Press Enter to send, Shift+Enter for new line
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  size="sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the sidebar to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Create Thread Dialog */}
      <CreateThreadDialog
        open={showCreateThread}
        onOpenChange={setShowCreateThread}
        onCreateThread={createThread}
      />

      {/* Templates Dialog */}
      <TemplatesDialog
        open={showTemplates}
        onOpenChange={setShowTemplates}
        templates={templates}
        onUseTemplate={(template) => setNewMessage(template.body)}
      />
    </div>
  );
}

// Create Thread Dialog Component
function CreateThreadDialog({ 
  open, 
  onOpenChange, 
  onCreateThread 
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateThread: (type: string, title: string, memberIds: string[]) => void;
}) {
  const [threadType, setThreadType] = useState('direct');
  const [title, setTitle] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);

  const handleCreate = () => {
    if (!title.trim()) return;
    onCreateThread(threadType, title, selectedMembers);
    setTitle('');
    setSelectedMembers([]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Conversation</DialogTitle>
          <DialogDescription>
            Start a new conversation with your yoga community members.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Type</label>
            <Select value={threadType} onValueChange={setThreadType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct">Direct Message</SelectItem>
                <SelectItem value="class">Class Discussion</SelectItem>
                <SelectItem value="retreat">Retreat Planning</SelectItem>
                <SelectItem value="announcement">Announcement</SelectItem>
                <SelectItem value="support">Support</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Conversation title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={!title.trim()}>
              Create
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Templates Dialog Component
function TemplatesDialog({
  open,
  onOpenChange,
  templates,
  onUseTemplate
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: MessageTemplate[];
  onUseTemplate: (template: MessageTemplate) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Yoga Message Templates</DialogTitle>
          <DialogDescription>
            Choose from pre-written yoga studio message templates to save time.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {templates.map((template) => (
            <Card key={template.id} className="cursor-pointer hover:bg-accent"
                  onClick={() => {
                    onUseTemplate(template);
                    onOpenChange(false);
                  }}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{template.name}</CardTitle>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {template.body.substring(0, 150)}
                  {template.body.length > 150 && '...'}
                </p>
              </CardContent>
            </Card>
          ))}

          {templates.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No templates available</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}