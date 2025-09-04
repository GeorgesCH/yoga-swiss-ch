import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  Shield, FileText, Lock, AlertTriangle, CheckCircle, 
  XCircle, Calendar, Clock, Download, Upload, Eye,
  Database, Users, Globe, Archive, Trash2, Settings,
  BookOpen, Scale, Flag, Bell, TrendingUp, BarChart3
} from 'lucide-react';

// Mock compliance data
const complianceModules = [
  {
    id: 'gdpr',
    name: 'GDPR Compliance',
    description: 'EU General Data Protection Regulation compliance',
    status: 'Compliant',
    lastAudit: '2024-01-10T10:00:00',
    nextAudit: '2024-07-10T10:00:00',
    score: 94,
    requirements: 12,
    completed: 11,
    issues: 1,
    regulations: ['Art. 5 GDPR', 'Art. 6 GDPR', 'Art. 17 GDPR', 'Art. 25 GDPR']
  },
  {
    id: 'dsg',
    name: 'Swiss Data Protection (DSG)',
    description: 'Swiss Federal Data Protection Act compliance',
    status: 'Compliant',
    lastAudit: '2024-01-08T14:30:00',
    nextAudit: '2024-07-08T14:30:00',
    score: 98,
    requirements: 8,
    completed: 8,
    issues: 0,
    regulations: ['Art. 6 DSG', 'Art. 7 DSG', 'Art. 19 DSG', 'Art. 25 DSG']
  },
  {
    id: 'finma',
    name: 'FINMA Requirements',
    description: 'Swiss Financial Market Supervisory Authority regulations',
    status: 'Partial',
    lastAudit: '2024-01-05T09:15:00',
    nextAudit: '2024-04-05T09:15:00',
    score: 78,
    requirements: 6,
    completed: 4,
    issues: 2,
    regulations: ['FINMA-RS 2008/21', 'FINMA-RS 2017/1']
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    description: 'Information Security Management System',
    status: 'In Progress',
    lastAudit: '2023-12-15T11:00:00',
    nextAudit: '2024-06-15T11:00:00',
    score: 65,
    requirements: 15,
    completed: 9,
    issues: 6,
    regulations: ['ISO/IEC 27001:2013', 'Annex A Controls']
  }
];

const dataRequests = [
  {
    id: 'req1',
    type: 'Data Access Request',
    status: 'Completed',
    customer: 'Sarah Chen',
    email: 'sarah.chen@email.com',
    requested: '2024-01-10T09:30:00',
    completed: '2024-01-12T14:20:00',
    deadline: '2024-01-28T23:59:59',
    priority: 'Normal'
  },
  {
    id: 'req2',
    type: 'Data Deletion Request',
    status: 'In Progress',
    customer: 'Marco Bernasconi',
    email: 'marco.b@email.com',
    requested: '2024-01-14T16:45:00',
    completed: null,
    deadline: '2024-02-01T23:59:59',
    priority: 'High'
  },
  {
    id: 'req3',
    type: 'Data Portability Request',
    status: 'Pending',
    customer: 'Amélie Dubois',
    email: 'amelie.dubois@email.com',
    requested: '2024-01-15T10:15:00',
    completed: null,
    deadline: '2024-02-02T23:59:59',
    priority: 'Normal'
  }
];

const auditHistory = [
  {
    id: 'audit1',
    title: 'GDPR Annual Compliance Audit',
    type: 'Internal',
    date: '2024-01-10T10:00:00',
    auditor: 'Swiss Compliance Partners',
    status: 'Completed',
    score: 94,
    findings: 3,
    recommendations: 5
  },
  {
    id: 'audit2',
    title: 'Data Security Assessment',
    type: 'External',
    date: '2023-12-15T14:00:00',
    auditor: 'CyberSec AG',
    status: 'Completed',
    score: 88,
    findings: 7,
    recommendations: 12
  },
  {
    id: 'audit3',
    title: 'Payment Processing Compliance',
    type: 'Regulatory',
    date: '2023-11-20T09:00:00',
    auditor: 'FINMA Inspector',
    status: 'Completed',
    score: 92,
    findings: 2,
    recommendations: 3
  }
];

const statusColors = {
  'Compliant': 'bg-green-100 text-green-800',
  'Partial': 'bg-yellow-100 text-yellow-800',
  'Non-Compliant': 'bg-red-100 text-red-800',
  'In Progress': 'bg-blue-100 text-blue-800'
};

const requestStatusColors = {
  'Completed': 'bg-green-100 text-green-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'Pending': 'bg-yellow-100 text-yellow-800',
  'Overdue': 'bg-red-100 text-red-800'
};

const priorityColors = {
  'Low': 'bg-gray-100 text-gray-800',
  'Normal': 'bg-blue-100 text-blue-800',
  'High': 'bg-orange-100 text-orange-800',
  'Critical': 'bg-red-100 text-red-800'
};

export function ComplianceManagement() {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModule, setSelectedModule] = useState<any>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysUntilDeadline = (deadlineString: string) => {
    const deadline = new Date(deadlineString);
    const now = new Date();
    const diffTime = deadline.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Compliant':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Partial':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'Non-Compliant':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-blue-600" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 75) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const ComplianceModuleCard = ({ module }: { module: any }) => (
    <Card className="hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => setSelectedModule(module)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-semibold">{module.name}</h3>
              <p className="text-sm text-muted-foreground">{module.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(module.status)}
            <Badge className={statusColors[module.status]}>
              {module.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Compliance Score</span>
            <span className={`text-lg font-bold ${getScoreColor(module.score)}`}>
              {module.score}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                module.score >= 90 ? 'bg-green-500' :
                module.score >= 75 ? 'bg-blue-500' :
                module.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${module.score}%` }}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-green-600">{module.completed}</div>
              <div className="text-xs text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-red-600">{module.issues}</div>
              <div className="text-xs text-muted-foreground">Issues</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{module.requirements}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            Next audit: {formatDate(module.nextAudit)}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Calculate summary stats
  const stats = {
    overallScore: Math.round(complianceModules.reduce((sum, m) => sum + m.score, 0) / complianceModules.length),
    compliantModules: complianceModules.filter(m => m.status === 'Compliant').length,
    totalIssues: complianceModules.reduce((sum, m) => sum + m.issues, 0),
    pendingRequests: dataRequests.filter(r => r.status !== 'Completed').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Compliance & Legal</h1>
          <p className="text-muted-foreground">
            Ensure GDPR, Swiss data protection, and regulatory compliance
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule Audit
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Score</p>
                <p className={`text-2xl font-bold ${getScoreColor(stats.overallScore)}`}>
                  {stats.overallScore}%
                </p>
                <p className="text-xs text-green-600">Excellent compliance</p>
              </div>
              <Shield className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant Modules</p>
                <p className="text-2xl font-bold">{stats.compliantModules}</p>
                <p className="text-xs text-blue-600">of {complianceModules.length} modules</p>
              </div>
              <CheckCircle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Issues</p>
                <p className="text-2xl font-bold text-red-600">{stats.totalIssues}</p>
                <p className="text-xs text-red-600">require attention</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                <p className="text-2xl font-bold">{stats.pendingRequests}</p>
                <p className="text-xs text-yellow-600">data requests</p>
              </div>
              <Clock className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Actions Alert */}
      {stats.totalIssues > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Action Required:</strong> {stats.totalIssues} compliance issue(s) need immediate attention to maintain regulatory compliance.
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="data-requests">Data Requests</TabsTrigger>
          <TabsTrigger value="audits">Audits</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Modules */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Compliance Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {complianceModules.map(module => (
                <ComplianceModuleCard key={module.id} module={module} />
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Compliance Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <div className="font-medium">GDPR Data Access Request Completed</div>
                    <div className="text-sm text-muted-foreground">
                      Personal data export for Sarah Chen delivered within deadline
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">2 hours ago</div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-yellow-600" />
                  <div className="flex-1">
                    <div className="font-medium">Data Retention Policy Review Due</div>
                    <div className="text-sm text-muted-foreground">
                      Annual review of data retention policies scheduled for next week
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">1 day ago</div>
                </div>

                <div className="flex items-center space-x-3 p-3 border rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <div className="font-medium">Privacy Impact Assessment Completed</div>
                    <div className="text-sm text-muted-foreground">
                      PIA for new mobile app features approved with recommendations
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">3 days ago</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data-requests" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Data Protection Requests</CardTitle>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Process Request
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dataRequests.map(request => (
                  <div key={request.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{request.type}</h3>
                        <p className="text-sm text-muted-foreground">
                          {request.customer} ({request.email})
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={priorityColors[request.priority]}>
                          {request.priority}
                        </Badge>
                        <Badge className={requestStatusColors[request.status]}>
                          {request.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Requested</div>
                        <div>{formatDate(request.requested)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Deadline</div>
                        <div className={getDaysUntilDeadline(request.deadline) < 7 ? 'text-red-600' : ''}>
                          {formatDate(request.deadline)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Days Remaining</div>
                        <div className={getDaysUntilDeadline(request.deadline) < 7 ? 'text-red-600 font-medium' : ''}>
                          {getDaysUntilDeadline(request.deadline)} days
                        </div>
                      </div>
                    </div>

                    {request.status !== 'Completed' && (
                      <div className="flex space-x-2 mt-4">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        <Button size="sm">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Mark Complete
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audits" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Audit History</CardTitle>
                <Button>
                  <Calendar className="w-4 h-4 mr-2" />
                  Schedule Audit
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auditHistory.map(audit => (
                  <div key={audit.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium">{audit.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {audit.auditor} • {audit.type} Audit
                        </p>
                      </div>
                      <Badge className={audit.status === 'Completed' ? statusColors.Compliant : statusColors['In Progress']}>
                        {audit.status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Date</div>
                        <div>{formatDate(audit.date)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Score</div>
                        <div className={`font-medium ${getScoreColor(audit.score)}`}>
                          {audit.score}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Findings</div>
                        <div className="font-medium">{audit.findings}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Recommendations</div>
                        <div className="font-medium">{audit.recommendations}</div>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download Report
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Privacy Policies & Documentation</CardTitle>
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Policy
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Policy Management</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage privacy policies, terms of service, and compliance documentation
                </p>
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-2" />
                    Privacy Policy
                  </Button>
                  <Button variant="outline">
                    <Scale className="w-4 h-4 mr-2" />
                    Terms of Service
                  </Button>
                  <Button variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    Data Processing
                  </Button>
                  <Button variant="outline">
                    <Archive className="w-4 h-4 mr-2" />
                    Retention Policy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Training</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Staff Training & Certification</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Track compliance training progress and certification status for all staff members
                </p>
                <Button>
                  <Users className="w-4 h-4 mr-2" />
                  View Training Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}