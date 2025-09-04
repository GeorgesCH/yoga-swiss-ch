import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../auth/AuthProvider';
import { peopleService, PeopleService, type Instructor } from '../../utils/supabase/people-service';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { 
  Search, Plus, Filter, Download, Upload, MessageSquare, 
  User, CreditCard, Calendar, FileText, Settings, 
  Phone, Mail, MapPin, Tag, TrendingUp, Clock,
  ChevronRight, Star, AlertCircle, Check, X,
  MoreHorizontal, Eye, Edit2, Trash2, Send,
  Users, Award, DollarSign, BookOpen, Languages,
  CheckCircle2, XCircle, Clock4, Briefcase,
  GraduationCap, Globe, Heart
} from 'lucide-react';
import { InstructorDetailDialog } from './InstructorDetailDialog';
import { InstructorBulkActionsDialog } from './InstructorBulkActionsDialog';
import { CreateInstructorDialog } from './CreateInstructorDialog';
import { InstructorScheduleDialog } from '../InstructorScheduleDialog';
import { InstructorProfileManagement } from './InstructorProfileManagement';
import { InstructorSchedulingManagement } from './InstructorSchedulingManagement';
import { InstructorPaymentManagement } from './InstructorPaymentManagement';

// Mock data for instructors
const mockInstructors = [
  {
    id: '1',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@yogaswiss.ch',
    phone: '+41 79 123 4567',
    avatar: null,
    status: 'Active',
    employment: 'Freelance',
    languages: ['en', 'de', 'zh'],
    specialties: ['Vinyasa', 'Yin Yoga', 'Meditation'],
    certifications: [
      { name: '200H YTT', organization: 'Yoga Alliance', year: 2019, expires: 2025 },
      { name: 'Yin Yoga Certification', organization: 'YinYoga.com', year: 2020 }
    ],
    experience_years: 5,
    rating: 4.8,
    total_classes: 324,
    monthly_classes: 28,
    hourly_rate: 85.00,
    monthly_earnings: 2380.00,
    preferred_payment: 'per_class',
    availability_score: 95,
    student_retention: 87,
    bio: 'Certified yoga instructor with 5+ years of experience in Vinyasa and Yin styles.',
    joinedDate: '2019-08-15',
    city: 'Zürich',
    lastActive: '2024-01-15',
    upcoming_classes: 12,
    completed_classes: 312,
    cancelled_classes: 0,
    nps_score: 9.2,
    social_media: {
      instagram: '@sarahyoga_zurich',
      website: 'sarahchenyoga.com'
    }
  },
  {
    id: '2',
    firstName: 'Marco',
    lastName: 'Bernasconi',
    email: 'marco.bernasconi@yogaswiss.ch',
    phone: '+41 76 234 5678',
    avatar: null,
    status: 'Active',
    employment: 'Employee',
    languages: ['it', 'de', 'en'],
    specialties: ['Ashtanga', 'Power Yoga', 'Pranayama'],
    certifications: [
      { name: '500H YTT', organization: 'Yoga Alliance', year: 2017, expires: 2024 },
      { name: 'Ashtanga Certification', organization: 'KPJAYI', year: 2018 }
    ],
    experience_years: 8,
    rating: 4.9,
    total_classes: 567,
    monthly_classes: 32,
    hourly_rate: 95.00,
    monthly_earnings: 3040.00,
    preferred_payment: 'per_hour',
    availability_score: 88,
    student_retention: 92,
    bio: 'Senior instructor specializing in traditional Ashtanga practice and breathwork.',
    joinedDate: '2017-03-20',
    city: 'Lugano',
    lastActive: '2024-01-14',
    upcoming_classes: 18,
    completed_classes: 549,
    cancelled_classes: 2,
    nps_score: 9.5,
    social_media: {
      instagram: '@marco_ashtanga'
    }
  },
  {
    id: '3',
    firstName: 'Amélie',
    lastName: 'Dubois',
    email: 'amelie.dubois@yogaswiss.ch',
    phone: '+41 78 345 6789',
    avatar: null,
    status: 'On Leave',
    employment: 'Freelance',
    languages: ['fr', 'en'],
    specialties: ['Hatha', 'Restorative', 'Prenatal'],
    certifications: [
      { name: '300H YTT', organization: 'Yoga Alliance', year: 2020 },
      { name: 'Prenatal Yoga Certification', organization: 'Birthlight', year: 2021 }
    ],
    experience_years: 4,
    rating: 4.7,
    total_classes: 189,
    monthly_classes: 0,
    hourly_rate: 75.00,
    monthly_earnings: 0.00,
    preferred_payment: 'per_class',
    availability_score: 0,
    student_retention: 85,
    bio: 'Gentle yoga instructor specializing in prenatal and restorative practices.',
    joinedDate: '2020-09-10',
    city: 'Genève',
    lastActive: '2023-12-20',
    upcoming_classes: 0,
    completed_classes: 189,
    cancelled_classes: 3,
    nps_score: 8.8,
    social_media: {
      website: 'amelieyoga.ch'
    }
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Wilson',
    email: 'david.wilson@yogaswiss.ch',
    phone: '+41 77 456 7890',
    avatar: null,
    status: 'Pending',
    employment: 'Freelance',
    languages: ['en'],
    specialties: ['Hot Yoga', 'Power Vinyasa'],
    certifications: [
      { name: '200H YTT', organization: 'Yoga Alliance', year: 2023 }
    ],
    experience_years: 1,
    rating: 4.5,
    total_classes: 12,
    monthly_classes: 8,
    hourly_rate: 65.00,
    monthly_earnings: 520.00,
    preferred_payment: 'per_class',
    availability_score: 100,
    student_retention: 78,
    bio: 'New instructor with passion for dynamic yoga practices.',
    joinedDate: '2024-01-01',
    city: 'Basel',
    lastActive: '2024-01-15',
    upcoming_classes: 6,
    completed_classes: 6,
    cancelled_classes: 0,
    nps_score: 8.2,
    social_media: {}
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Müller',
    email: 'lisa.mueller@yogaswiss.ch',
    phone: '+41 79 567 8901',
    avatar: null,
    status: 'Inactive',
    employment: 'Freelance',
    languages: ['de', 'en'],
    specialties: ['Kundalini', 'Meditation', 'Sound Healing'],
    certifications: [
      { name: 'Kundalini Yoga Certification', organization: '3HO', year: 2018 },
      { name: 'Sound Healing Certification', organization: 'Sound Healing Academy', year: 2019 }
    ],
    experience_years: 6,
    rating: 4.6,
    total_classes: 298,
    monthly_classes: 0,
    hourly_rate: 80.00,
    monthly_earnings: 0.00,
    preferred_payment: 'per_class',
    availability_score: 0,
    student_retention: 82,
    bio: 'Spiritual teacher focusing on Kundalini yoga and sound healing practices.',
    joinedDate: '2018-05-12',
    city: 'Bern',
    lastActive: '2023-11-30',
    upcoming_classes: 0,
    completed_classes: 298,
    cancelled_classes: 8,
    nps_score: 8.6,
    social_media: {
      instagram: '@lisakundalini',
      website: 'soundhealingbern.ch'
    }
  }
];

const statusColors = {
  'Active': 'bg-green-100 text-green-800',
  'Inactive': 'bg-gray-100 text-gray-800', 
  'On Leave': 'bg-yellow-100 text-yellow-800',
  'Pending': 'bg-blue-100 text-blue-800',
  'Suspended': 'bg-red-100 text-red-800'
};

const employmentColors = {
  'Employee': 'bg-blue-100 text-blue-800',
  'Freelance': 'bg-purple-100 text-purple-800',
  'Contract': 'bg-indigo-100 text-indigo-800'
};

const specialtyColors = {
  'Vinyasa': 'bg-emerald-100 text-emerald-800',
  'Yin Yoga': 'bg-pink-100 text-pink-800',
  'Meditation': 'bg-violet-100 text-violet-800',
  'Ashtanga': 'bg-orange-100 text-orange-800',
  'Power Yoga': 'bg-red-100 text-red-800',
  'Pranayama': 'bg-cyan-100 text-cyan-800',
  'Hatha': 'bg-green-100 text-green-800',
  'Restorative': 'bg-teal-100 text-teal-800',
  'Prenatal': 'bg-rose-100 text-rose-800',
  'Hot Yoga': 'bg-amber-100 text-amber-800',
  'Power Vinyasa': 'bg-lime-100 text-lime-800',
  'Kundalini': 'bg-indigo-100 text-indigo-800',
  'Sound Healing': 'bg-purple-100 text-purple-800'
};

export function InstructorManagement() {
  const { session } = useAuth();
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedEmployment, setSelectedEmployment] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
  const [selectedInstructor, setSelectedInstructor] = useState<any>(null);
  const [showInstructorDetail, setShowInstructorDetail] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showProfileManagement, setShowProfileManagement] = useState(false);
  const [showSchedulingManagement, setShowSchedulingManagement] = useState(false);
  const [showPaymentManagement, setShowPaymentManagement] = useState(false);
  const [sortBy, setSortBy] = useState('totalClasses');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Load instructors data
  useEffect(() => {
    loadInstructors();
  }, [session]);

  const loadInstructors = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Initialize service with access token
      // Extract access token from session (Supabase session structure)
      const accessToken = session?.access_token;
      console.log('Instructor session debug:', { 
        hasSession: !!session, 
        hasAccessToken: !!accessToken,
        sessionKeys: session ? Object.keys(session) : []
      });
      
      const service = accessToken 
        ? new PeopleService(accessToken)
        : peopleService;
      
      const { instructors: instructorData, error: instructorError } = await service.getInstructors();
      
      if (instructorError) {
        setError(instructorError);
        console.error('Error loading instructors:', instructorError);
      } else {
        setInstructors(instructorData);
        console.log('Loaded instructors:', instructorData.length);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load instructors';
      setError(errorMessage);
      console.error('Error in loadInstructors:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get unique values for filters from actual data
  const statuses = [...new Set(instructors.map(i => i.status))];
  const languages = [...new Set(instructors.map(i => i.language))];

  // Filter and sort instructors
  const filteredInstructors = useMemo(() => {
    let filtered = instructors.filter(instructor => {
      const matchesSearch = searchTerm === '' || 
        instructor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructor.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || instructor.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });

    // Sort instructors
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = `${a.firstName} ${a.lastName}`;
          bValue = `${b.firstName} ${b.lastName}`;
          break;
        case 'totalClasses':
          aValue = a.totalClasses;
          bValue = b.totalClasses;
          break;
        case 'joinedDate':
          aValue = new Date(a.joinedDate || 0).getTime();
          bValue = new Date(b.joinedDate || 0).getTime();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [instructors, searchTerm, selectedStatus, sortBy, sortOrder]);

  const toggleInstructorSelection = (instructorId: string) => {
    setSelectedInstructors(prev => 
      prev.includes(instructorId)
        ? prev.filter(id => id !== instructorId)
        : [...prev, instructorId]
    );
  };

  const toggleAllInstructors = () => {
    if (selectedInstructors.length === filteredInstructors.length) {
      setSelectedInstructors([]);
    } else {
      setSelectedInstructors(filteredInstructors.map(i => i.id));
    }
  };

  const openInstructorDetail = (instructor: any) => {
    setSelectedInstructor(instructor);
    setShowInstructorDetail(true);
  };

  const openScheduleDialog = (instructor: any) => {
    setSelectedInstructor(instructor);
    setShowScheduleDialog(true);
  };

  const openProfileManagement = (instructor: any) => {
    setSelectedInstructor(instructor);
    setShowProfileManagement(true);
  };

  const openSchedulingManagement = (instructor: any) => {
    setSelectedInstructor(instructor);
    setShowSchedulingManagement(true);
  };

  const openPaymentManagement = (instructor: any) => {
    setSelectedInstructor(instructor);
    setShowPaymentManagement(true);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getLanguageFlag = (lang: string) => {
    const flags = { de: '🇩🇪', fr: '🇫🇷', it: '🇮🇹', en: '🇬🇧', zh: '🇨🇳' };
    return flags[lang as keyof typeof flags] || '🌐';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Active':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'Inactive':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      case 'On Leave':
        return <Clock4 className="w-4 h-4 text-yellow-600" />;
      case 'Pending':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const InstructorListItem = ({ instructor }: { instructor: Instructor }) => (
    <div className="flex items-center p-4 border-b hover:bg-gray-50 cursor-pointer"
         onClick={() => openInstructorDetail(instructor)}>
      <Checkbox 
        checked={selectedInstructors.includes(instructor.id)}
        onCheckedChange={() => toggleInstructorSelection(instructor.id)}
        onClick={(e) => e.stopPropagation()}
      />
      
      <Avatar className="w-12 h-12 ml-3">
        <AvatarImage src={instructor.avatar} />
        <AvatarFallback className="bg-primary/10">
          {getInitials(instructor.firstName, instructor.lastName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 ml-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center space-x-2">
                <div className="font-medium text-base">
                  {instructor.firstName} {instructor.lastName}
                </div>
                {getStatusIcon(instructor.status)}
              </div>
              <div className="text-sm text-gray-600 flex items-center space-x-2 mt-1">
                <span>{instructor.email}</span>
                <span>•</span>
                <span className="text-xs">
                  {getLanguageFlag(instructor.language)}
                </span>
              </div>
            </div>
            
            <div className="flex flex-col space-y-1">
              <Badge className={statusColors[instructor.status] || 'bg-gray-100 text-gray-800'}>
                {instructor.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {instructor.language}
              </Badge>
            </div>
          </div>

          <div className="flex items-center space-x-8 text-sm">
            <div className="text-right">
              <div className="font-medium">{instructor.totalClasses}</div>
              <div className="text-xs text-gray-500">Total classes</div>
            </div>
            
            <div className="text-right">
              <div className="font-medium">{formatDate(instructor.joinedDate)}</div>
              <div className="text-xs text-gray-500">Joined</div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  openSchedulingManagement(instructor);
                }}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Calculate summary stats
  const stats = {
    total: instructors.length,
    active: instructors.filter(i => i.status === 'Active').length,
    totalClasses: instructors.reduce((sum, i) => sum + i.totalClasses, 0)
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Instructor Management</h1>
          <p className="text-muted-foreground">
            Manage instructor profiles, schedules, and payments
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Instructor
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Instructors</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.total}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  {stats.active} active
                </p>
              </div>
              <Users className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Instructors</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.active}</p>
                <p className="text-xs text-muted-foreground">
                  Currently teaching
                </p>
              </div>
              <Award className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Classes Taught</p>
                <p className="text-2xl font-bold">{loading ? '...' : stats.totalClasses}</p>
                <p className="text-xs text-muted-foreground">
                  All time
                </p>
              </div>
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Languages Supported</p>
                <p className="text-2xl font-bold">{loading ? '...' : languages.length}</p>
                <p className="text-xs text-muted-foreground">
                  Available languages
                </p>
              </div>
              <Globe className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search instructors..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>

              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {statuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedSpecialty} onValueChange={setSelectedSpecialty}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Languages</SelectItem>
                  {languages.map(lang => (
                    <SelectItem key={lang} value={lang}>{lang}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-3">
              {selectedInstructors.length > 0 && (
                <Button variant="outline" onClick={() => setShowBulkActions(true)}>
                  <Send className="w-4 h-4 mr-2" />
                  Actions ({selectedInstructors.length})
                </Button>
              )}
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="totalClasses">Total Classes</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="joinedDate">Joined Date</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Select All Header */}
          <div className="flex items-center p-4 border-b bg-gray-50">
            <Checkbox 
              checked={selectedInstructors.length === filteredInstructors.length}
              onCheckedChange={toggleAllInstructors}
            />
            <span className="ml-3 text-sm font-medium">
              {filteredInstructors.length} instructors 
              {selectedInstructors.length > 0 && ` (${selectedInstructors.length} selected)`}
            </span>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="p-12 text-center">
              <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading instructors...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-12 text-center text-red-600">
              <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Error Loading Instructors</h3>
              <p className="mb-4">{error}</p>
              <Button onClick={loadInstructors} variant="outline">
                Try Again
              </Button>
            </div>
          )}

          {/* Instructor List */}
          {!loading && !error && (
            <div className="divide-y">
              {filteredInstructors.map(instructor => (
                <InstructorListItem key={instructor.id} instructor={instructor} />
              ))}
            </div>
          )}

          {!loading && !error && filteredInstructors.length === 0 && instructors.length > 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No instructors found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}

          {!loading && !error && instructors.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No instructors yet</h3>
              <p className="mb-4">Start by adding your first instructor</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Instructor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogs */}
      {showInstructorDetail && selectedInstructor && (
        <InstructorDetailDialog
          instructor={selectedInstructor}
          onClose={() => setShowInstructorDetail(false)}
          onSchedule={() => {
            setShowInstructorDetail(false);
            setShowScheduleDialog(true);
          }}
        />
      )}

      {showScheduleDialog && selectedInstructor && (
        <InstructorScheduleDialog
          isOpen={showScheduleDialog}
          onClose={() => setShowScheduleDialog(false)}
          instructor={selectedInstructor}
          assignments={[]} // Would be loaded based on instructor
          onAssignClass={(instructorId) => console.log('Assign class to:', instructorId)}
          onEditAssignment={(assignmentId) => console.log('Edit assignment:', assignmentId)}
          onRemoveAssignment={(assignmentId) => console.log('Remove assignment:', assignmentId)}
        />
      )}

      {showBulkActions && (
        <InstructorBulkActionsDialog
          selectedInstructors={selectedInstructors}
          onClose={() => setShowBulkActions(false)}
          onComplete={() => {
            setShowBulkActions(false);
            setSelectedInstructors([]);
          }}
        />
      )}

      {showCreateDialog && (
        <CreateInstructorDialog
          onClose={() => setShowCreateDialog(false)}
          onCreate={(instructorData) => {
            console.log('Create instructor:', instructorData);
            setShowCreateDialog(false);
          }}
        />
      )}
    </div>
  );
}