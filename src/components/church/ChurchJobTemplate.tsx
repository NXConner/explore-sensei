import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Church, MapPin, Calendar, Users, DollarSign, Clock, AlertCircle } from 'lucide-react';
import type { Job, JobFormData } from '@/types';

interface ChurchJobTemplateProps {
  onTemplateSelect: (template: JobFormData) => void;
  onClose: () => void;
}

interface ChurchJobTemplate {
  id: string;
  name: string;
  description: string;
  category: 'parking' | 'sealcoating' | 'line-striping' | 'crack-sealing' | 'maintenance';
  estimatedDuration: number; // in hours
  estimatedCost: number;
  requiredEquipment: string[];
  specialConsiderations: string[];
  icon: React.ReactNode;
  color: string;
}

const churchJobTemplates: ChurchJobTemplate[] = [
  {
    id: 'church-parking-sealcoat',
    name: 'Church Parking Lot Sealcoating',
    description: 'Complete sealcoating of church parking lot with crack sealing and line striping',
    category: 'sealcoating',
    estimatedDuration: 8,
    estimatedCost: 2500,
    requiredEquipment: ['Sealcoat sprayer', 'Crack sealer', 'Line striping machine', 'Pressure washer'],
    specialConsiderations: [
      'Avoid Sunday services (schedule Monday-Saturday)',
      'Coordinate with church events calendar',
      'Provide alternative parking arrangements',
      'Consider weather delays for outdoor work'
    ],
    icon: <Church className="h-5 w-5" />,
    color: 'bg-blue-500'
  },
  {
    id: 'church-line-striping',
    name: 'Parking Line Striping',
    description: 'Fresh line striping for church parking lot with optimized space layout',
    category: 'line-striping',
    estimatedDuration: 4,
    estimatedCost: 800,
    requiredEquipment: ['Line striping machine', 'Measuring tools', 'Traffic cones'],
    specialConsiderations: [
      'Maximize parking spaces for church capacity',
      'Ensure ADA compliance for accessible spaces',
      'Consider bus/van parking areas',
      'Coordinate with church office for access'
    ],
    icon: <MapPin className="h-5 w-5" />,
    color: 'bg-green-500'
  },
  {
    id: 'church-crack-sealing',
    name: 'Crack Sealing & Repair',
    description: 'Repair cracks and minor damage in church parking lot',
    category: 'crack-sealing',
    estimatedDuration: 6,
    estimatedCost: 1200,
    requiredEquipment: ['Crack sealer', 'Cleaning equipment', 'Safety equipment'],
    specialConsiderations: [
      'Address safety concerns for elderly parishioners',
      'Minimize disruption to church activities',
      'Ensure proper drainage maintenance',
      'Coordinate with church maintenance schedule'
    ],
    icon: <AlertCircle className="h-5 w-5" />,
    color: 'bg-orange-500'
  },
  {
    id: 'church-maintenance',
    name: 'Preventive Maintenance',
    description: 'Regular maintenance to extend parking lot life',
    category: 'maintenance',
    estimatedDuration: 3,
    estimatedCost: 600,
    requiredEquipment: ['Cleaning equipment', 'Sealant applicator', 'Safety equipment'],
    specialConsiderations: [
      'Schedule during low-activity periods',
      'Coordinate with church calendar',
      'Provide maintenance schedule for future planning',
      'Document condition for insurance purposes'
    ],
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-purple-500'
  }
];

export const ChurchJobTemplate: React.FC<ChurchJobTemplateProps> = ({ onTemplateSelect, onClose }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<ChurchJobTemplate | null>(null);
  const [customizations, setCustomizations] = useState({
    lotSize: '',
    specialRequirements: '',
    preferredSchedule: '',
    contactPerson: '',
    phoneNumber: '',
    email: ''
  });

  const handleTemplateSelect = (template: ChurchJobTemplate) => {
    setSelectedTemplate(template);
  };

  const handleCustomizationChange = (field: string, value: string) => {
    setCustomizations(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateJob = () => {
    if (!selectedTemplate) return;

    const jobData: JobFormData = {
      title: selectedTemplate.name,
      description: `${selectedTemplate.description}\n\nChurch Details:\n- Lot Size: ${customizations.lotSize}\n- Special Requirements: ${customizations.specialRequirements}\n- Preferred Schedule: ${customizations.preferredSchedule}\n- Contact: ${customizations.contactPerson} (${customizations.phoneNumber}, ${customizations.email})`,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + selectedTemplate.estimatedDuration * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      budget: selectedTemplate.estimatedCost,
      location: 'Church Parking Lot',
      assigned_employees: []
    };

    onTemplateSelect(jobData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold flex items-center justify-center gap-2">
          <Church className="h-5 w-5" />
          Church Parking Lot Services
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Specialized templates for church parking lot maintenance and improvements
        </p>
      </div>

      {!selectedTemplate ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {churchJobTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${template.color} text-white`}>
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {template.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {template.estimatedDuration}h
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      ${template.estimatedCost.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {template.requiredEquipment.slice(0, 2).map((equipment, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {equipment}
                      </Badge>
                    ))}
                    {template.requiredEquipment.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.requiredEquipment.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Selected Template Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${selectedTemplate.color} text-white`}>
                    {selectedTemplate.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{selectedTemplate.name}</CardTitle>
                    <CardDescription>{selectedTemplate.description}</CardDescription>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Change Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Duration: {selectedTemplate.estimatedDuration} hours</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Est. Cost: ${selectedTemplate.estimatedCost.toLocaleString()}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">Required Equipment</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTemplate.requiredEquipment.map((equipment, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <Label className="text-sm font-medium">Special Considerations</Label>
                  <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                    {selectedTemplate.specialConsiderations.map((consideration, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary">•</span>
                        {consideration}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Church-Specific Customizations */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Church Details</CardTitle>
              <CardDescription>
                Provide specific information about your church's parking lot needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="lot-size">Parking Lot Size (sq ft)</Label>
                  <Input
                    id="lot-size"
                    placeholder="e.g., 15,000"
                    value={customizations.lotSize}
                    onChange={(e) => handleCustomizationChange('lotSize', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact-person">Contact Person</Label>
                  <Input
                    id="contact-person"
                    placeholder="Pastor John Smith"
                    value={customizations.contactPerson}
                    onChange={(e) => handleCustomizationChange('contactPerson', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="(555) 123-4567"
                    value={customizations.phoneNumber}
                    onChange={(e) => handleCustomizationChange('phoneNumber', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="pastor@church.org"
                    value={customizations.email}
                    onChange={(e) => handleCustomizationChange('email', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferred-schedule">Preferred Schedule</Label>
                <Select 
                  value={customizations.preferredSchedule} 
                  onValueChange={(value) => handleCustomizationChange('preferredSchedule', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select preferred timing" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekday-morning">Weekday Morning (8 AM - 12 PM)</SelectItem>
                    <SelectItem value="weekday-afternoon">Weekday Afternoon (1 PM - 5 PM)</SelectItem>
                    <SelectItem value="saturday-morning">Saturday Morning (8 AM - 12 PM)</SelectItem>
                    <SelectItem value="saturday-afternoon">Saturday Afternoon (1 PM - 5 PM)</SelectItem>
                    <SelectItem value="flexible">Flexible - Will coordinate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="special-requirements">Special Requirements</Label>
                <Textarea
                  id="special-requirements"
                  placeholder="Any special considerations, accessibility needs, or specific requirements..."
                  value={customizations.specialRequirements}
                  onChange={(e) => handleCustomizationChange('specialRequirements', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleCreateJob} className="gap-2">
              <Church className="h-4 w-4" />
              Create Church Job
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
