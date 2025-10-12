import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  FileText, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Download,
  Upload,
  Calendar,
  Award,
  Building,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Star,
  Flag
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Certification {
  id: string;
  name: string;
  type: 'VOSB' | 'SDVOSB' | 'SWaM' | 'HUB' | '8A' | 'WOSB';
  status: 'active' | 'pending' | 'expired' | 'suspended';
  issueDate: Date;
  expiryDate: Date;
  issuingAgency: string;
  certificationNumber: string;
  documents: string[];
  requirements: string[];
  complianceScore: number;
}

interface ComplianceRequirement {
  id: string;
  name: string;
  description: string;
  category: 'employment' | 'financial' | 'documentation' | 'reporting' | 'performance';
  status: 'compliant' | 'non_compliant' | 'pending' | 'not_applicable';
  dueDate?: Date;
  lastUpdated: Date;
  documents: string[];
  notes: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface BusinessMetrics {
  totalRevenue: number;
  governmentContracts: number;
  employeeCount: number;
  veteranEmployees: number;
  veteranOwnership: number;
  yearsInBusiness: number;
  pastPerformance: {
    onTimeDelivery: number;
    qualityRating: number;
    customerSatisfaction: number;
  };
}

interface VeteranBusinessComplianceProps {
  onSave?: (data: any) => void;
  onExport?: (data: any) => void;
}

export const VeteranBusinessCompliance: React.FC<VeteranBusinessComplianceProps> = ({
  onSave,
  onExport
}) => {
  const [certifications, setCertifications] = useState<Certification[]>([
    {
      id: '1',
      name: 'Veteran-Owned Small Business',
      type: 'VOSB',
      status: 'active',
      issueDate: new Date('2023-01-15'),
      expiryDate: new Date('2025-01-15'),
      issuingAgency: 'VA Center for Verification and Evaluation',
      certificationNumber: 'VOSB-2023-001234',
      documents: ['DD-214', 'Business Registration', 'Financial Statements'],
      requirements: ['51% veteran ownership', 'Veteran control', 'Small business size standards'],
      complianceScore: 95
    },
    {
      id: '2',
      name: 'Virginia SWaM Certification',
      type: 'SWaM',
      status: 'active',
      issueDate: new Date('2023-02-01'),
      expiryDate: new Date('2025-02-01'),
      issuingAgency: 'Virginia Department of Small Business and Supplier Diversity',
      certificationNumber: 'SWaM-VA-2023-5678',
      documents: ['Business License', 'Tax Returns', 'Insurance Certificates'],
      requirements: ['Virginia business registration', 'Small business size standards', 'Good standing'],
      complianceScore: 88
    },
    {
      id: '3',
      name: 'North Carolina HUB Certification',
      type: 'HUB',
      status: 'pending',
      issueDate: new Date(),
      expiryDate: new Date('2026-01-01'),
      issuingAgency: 'North Carolina Department of Administration',
      certificationNumber: 'HUB-NC-2024-9012',
      documents: ['Application', 'Supporting Documents'],
      requirements: ['NC business registration', 'Minority ownership', 'Control requirements'],
      complianceScore: 0
    }
  ]);

  const [requirements, setRequirements] = useState<ComplianceRequirement[]>([
    {
      id: '1',
      name: 'Annual Employment Report',
      description: 'Report veteran employment statistics',
      category: 'employment',
      status: 'compliant',
      dueDate: new Date('2024-03-31'),
      lastUpdated: new Date('2024-01-15'),
      documents: ['Employment Report 2023.pdf'],
      notes: 'Submitted on time with all required information',
      priority: 'high'
    },
    {
      id: '2',
      name: 'Financial Statements',
      description: 'Annual financial statements and tax returns',
      category: 'financial',
      status: 'compliant',
      dueDate: new Date('2024-04-15'),
      lastUpdated: new Date('2024-01-10'),
      documents: ['Financial Statements 2023.pdf', 'Tax Return 2023.pdf'],
      notes: 'All financial documents submitted and approved',
      priority: 'high'
    },
    {
      id: '3',
      name: 'Performance Reporting',
      description: 'Quarterly performance reports for government contracts',
      category: 'reporting',
      status: 'pending',
      dueDate: new Date('2024-02-15'),
      lastUpdated: new Date('2024-01-20'),
      documents: [],
      notes: 'Due for Q4 2023 reporting',
      priority: 'medium'
    },
    {
      id: '4',
      name: 'Insurance Coverage',
      description: 'Maintain required insurance coverage',
      category: 'documentation',
      status: 'compliant',
      dueDate: new Date('2024-12-31'),
      lastUpdated: new Date('2024-01-01'),
      documents: ['General Liability Policy.pdf', 'Workers Comp Policy.pdf'],
      notes: 'All insurance policies current and adequate',
      priority: 'high'
    }
  ]);

  const [businessMetrics, setBusinessMetrics] = useState<BusinessMetrics>({
    totalRevenue: 1250000,
    governmentContracts: 3,
    employeeCount: 3,
    veteranEmployees: 2,
    veteranOwnership: 100,
    yearsInBusiness: 5,
    pastPerformance: {
      onTimeDelivery: 98,
      qualityRating: 4.8,
      customerSatisfaction: 4.9
    }
  });

  const [selectedCertification, setSelectedCertification] = useState<Certification | null>(null);
  const [selectedRequirement, setSelectedRequirement] = useState<ComplianceRequirement | null>(null);
  const [showAddCertification, setShowAddCertification] = useState(false);
  const [showAddRequirement, setShowAddRequirement] = useState(false);

  const { toast } = useToast();

  // Calculate overall compliance score
  const overallCompliance = Math.round(
    requirements.reduce((sum, req) => {
      if (req.status === 'compliant') return sum + 100;
      if (req.status === 'pending') return sum + 50;
      if (req.status === 'non_compliant') return sum + 0;
      return sum + 75; // not_applicable
    }, 0) / requirements.length
  );

  // Get compliance by category
  const complianceByCategory = {
    employment: requirements.filter(r => r.category === 'employment'),
    financial: requirements.filter(r => r.category === 'financial'),
    documentation: requirements.filter(r => r.category === 'documentation'),
    reporting: requirements.filter(r => r.category === 'reporting'),
    performance: requirements.filter(r => r.category === 'performance')
  };

  // Get upcoming deadlines
  const upcomingDeadlines = requirements
    .filter(req => req.dueDate && req.dueDate > new Date())
    .sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime())
    .slice(0, 5);

  // Get overdue items
  const overdueItems = requirements.filter(req => 
    req.dueDate && req.dueDate < new Date() && req.status !== 'compliant'
  );

  const handleSave = () => {
    const data = {
      certifications,
      requirements,
      businessMetrics,
      lastUpdated: new Date()
    };
    
    if (onSave) {
      onSave(data);
    }
    
    toast({
      title: 'Compliance Data Saved',
      description: 'All compliance information has been saved successfully'
    });
  };

  const handleExport = () => {
    const data = {
      certifications,
      requirements,
      businessMetrics,
      overallCompliance,
      exportDate: new Date()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `veteran-business-compliance-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    if (onExport) {
      onExport(data);
    }
    
    toast({
      title: 'Compliance Data Exported',
      description: 'Compliance report has been exported successfully'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'active':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'non_compliant':
      case 'expired':
      case 'suspended':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'text-red-600';
      case 'high':
        return 'text-orange-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-600" />
            Veteran Business Compliance
          </h1>
          <p className="text-muted-foreground">
            Manage certifications, compliance requirements, and business metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={handleSave} className="gap-2">
            <FileText className="h-4 w-4" />
            Save Data
          </Button>
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overall Compliance</p>
                <p className="text-2xl font-bold">{overallCompliance}%</p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Progress value={overallCompliance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Certifications</p>
                <p className="text-2xl font-bold">
                  {certifications.filter(c => c.status === 'active').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Award className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Requirements</p>
                <p className="text-2xl font-bold">
                  {requirements.filter(r => r.status === 'pending').length}
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Items</p>
                <p className="text-2xl font-bold text-red-600">{overdueItems.length}</p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overdueItems.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            You have {overdueItems.length} overdue compliance requirements. Please address these items immediately.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="certifications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="certifications">Certifications</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="metrics">Business Metrics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="certifications" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Certifications</h2>
            <Button onClick={() => setShowAddCertification(true)}>
              Add Certification
            </Button>
          </div>

          <div className="grid gap-4">
            {certifications.map((cert) => (
              <Card key={cert.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(cert.status)}`} />
                      <div>
                        <h3 className="font-semibold">{cert.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cert.issuingAgency} • {cert.certificationNumber}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{cert.type}</Badge>
                          <Badge className={getStatusColor(cert.status)}>
                            {cert.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Expires: {cert.expiryDate.toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{cert.complianceScore}%</div>
                      <div className="text-sm text-muted-foreground">Compliance Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Compliance Requirements</h2>
            <Button onClick={() => setShowAddRequirement(true)}>
              Add Requirement
            </Button>
          </div>

          <div className="grid gap-4">
            {requirements.map((req) => (
              <Card key={req.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(req.status)}`} />
                      <div>
                        <h3 className="font-semibold">{req.name}</h3>
                        <p className="text-sm text-muted-foreground">{req.description}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{req.category}</Badge>
                          <Badge className={getStatusColor(req.status)}>
                            {req.status}
                          </Badge>
                          <span className={`text-sm font-medium ${getPriorityColor(req.priority)}`}>
                            {req.priority} priority
                          </span>
                          {req.dueDate && (
                            <span className="text-sm text-muted-foreground">
                              Due: {req.dueDate.toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        Last Updated: {req.lastUpdated.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <h2 className="text-xl font-semibold">Business Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Financial Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Revenue</span>
                  <span className="font-semibold">${businessMetrics.totalRevenue.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Government Contracts</span>
                  <span className="font-semibold">{businessMetrics.governmentContracts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Years in Business</span>
                  <span className="font-semibold">{businessMetrics.yearsInBusiness}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Employment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Total Employees</span>
                  <span className="font-semibold">{businessMetrics.employeeCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Veteran Employees</span>
                  <span className="font-semibold">{businessMetrics.veteranEmployees}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Veteran Ownership</span>
                  <span className="font-semibold">{businessMetrics.veteranOwnership}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">On-Time Delivery</span>
                  <span className="font-semibold">{businessMetrics.pastPerformance.onTimeDelivery}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Quality Rating</span>
                  <span className="font-semibold">{businessMetrics.pastPerformance.qualityRating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Customer Satisfaction</span>
                  <span className="font-semibold">{businessMetrics.pastPerformance.customerSatisfaction}/5</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <h2 className="text-xl font-semibold">Compliance Reports</h2>
          
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upcoming Deadlines</CardTitle>
                <CardDescription>Requirements due in the next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingDeadlines.map((req) => (
                      <div key={req.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <span className="font-medium">{req.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            Due: {req.dueDate!.toLocaleDateString()}
                          </span>
                        </div>
                        <Badge className={getStatusColor(req.status)}>
                          {req.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No upcoming deadlines</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Compliance by Category</CardTitle>
                <CardDescription>Status breakdown by requirement category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(complianceByCategory).map(([category, reqs]) => (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium capitalize">{category}</span>
                        <span className="text-sm text-muted-foreground">
                          {reqs.filter(r => r.status === 'compliant').length} / {reqs.length} compliant
                        </span>
                      </div>
                      <Progress 
                        value={(reqs.filter(r => r.status === 'compliant').length / reqs.length) * 100} 
                        className="h-2"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VeteranBusinessCompliance;
