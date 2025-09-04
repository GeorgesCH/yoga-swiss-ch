import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Checkbox } from './checkbox';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';
import { Badge } from './badge';
import { Alert, AlertDescription } from './alert';
import { 
  Shield, 
  FileText, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Signature,
  Calendar
} from 'lucide-react';
import { Label } from './label';
import { Input } from './input';

interface WaiverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: (waiverData: WaiverAcceptanceData) => void;
  classTitle: string;
  studioName: string;
  waiverType?: 'standard' | 'yoga' | 'fitness' | 'outdoor' | 'retreat';
  requiresSignature?: boolean;
  requiresEmergencyContact?: boolean;
}

interface WaiverAcceptanceData {
  accepted: boolean;
  acceptedAt: Date;
  ipAddress?: string;
  signature?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalConditions?: string;
  consentToMarketing?: boolean;
}

export function WaiverModal({
  isOpen,
  onClose,
  onAccept,
  classTitle,
  studioName,
  waiverType = 'yoga',
  requiresSignature = false,
  requiresEmergencyContact = false
}: WaiverModalProps) {
  const [hasRead, setHasRead] = useState(false);
  const [hasAccepted, setHasAccepted] = useState(false);
  const [signature, setSignature] = useState('');
  const [emergencyContact, setEmergencyContact] = useState({
    name: '',
    phone: '',
    relationship: ''
  });
  const [medicalConditions, setMedicalConditions] = useState('');
  const [consentToMarketing, setConsentToMarketing] = useState(false);

  const getWaiverContent = () => {
    switch (waiverType) {
      case 'yoga':
        return {
          title: 'Yoga Class Liability Waiver',
          content: `
**ASSUMPTION OF RISK AND RELEASE OF LIABILITY**

I understand that yoga includes physical movements and there is a risk of injury. I voluntarily participate in yoga activities offered by ${studioName} with full knowledge that there is risk of personal injury, property loss, or death.

**PHYSICAL CONDITION**
I represent that I am in good physical condition and have no medical condition that would prevent my safe participation in yoga activities. I will inform the instructor of any physical limitations, injuries, or medical conditions.

**RELEASE AND WAIVER**
I hereby release, waive, discharge and covenant not to sue ${studioName}, its instructors, employees, and agents from any and all liability, claims, demands, actions and causes of action arising from my participation in yoga activities.

**MEDICAL TREATMENT**
I give permission for ${studioName} staff to seek emergency medical treatment on my behalf if necessary.

**PHOTOGRAPHY/MARKETING**
I understand that photos or videos may be taken during classes for marketing purposes and consent to their use unless I opt out.
          `
        };
      case 'outdoor':
        return {
          title: 'Outdoor Activity Liability Waiver',
          content: `
**OUTDOOR ACTIVITY RISKS**

I understand that outdoor yoga and fitness activities involve additional risks including weather conditions, terrain, and environmental factors. I voluntarily assume these risks.

**WEATHER CONDITIONS**
I understand that outdoor activities may be subject to weather conditions and agree to follow instructor guidance regarding safety and class cancellations.

**EQUIPMENT AND SAFETY**
I will use only approved equipment and follow all safety instructions provided by ${studioName} instructors.

**RELEASE OF LIABILITY**
I hereby release ${studioName} from any claims arising from outdoor activity participation, including but not limited to weather-related incidents, terrain hazards, or equipment issues.
          `
        };
      default:
        return {
          title: 'Liability Waiver and Release',
          content: `
**GENERAL LIABILITY WAIVER**

By participating in activities at ${studioName}, I acknowledge and assume all risks associated with physical activity and release the studio from liability for any injuries or damages that may occur.
          `
        };
    }
  };

  const waiver = getWaiverContent();

  const handleAccept = () => {
    if (!hasRead || !hasAccepted) return;

    const waiverData: WaiverAcceptanceData = {
      accepted: true,
      acceptedAt: new Date(),
      ipAddress: 'client-ip', // Would be populated server-side
      signature: requiresSignature ? signature : undefined,
      emergencyContact: requiresEmergencyContact ? emergencyContact : undefined,
      medicalConditions: medicalConditions || undefined,
      consentToMarketing
    };

    onAccept(waiverData);
    onClose();
  };

  const isValid = hasRead && hasAccepted && 
    (!requiresSignature || signature.trim().length > 0) &&
    (!requiresEmergencyContact || (emergencyContact.name && emergencyContact.phone));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {waiver.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Class Information */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Class Details</span>
            </div>
            <div className="text-sm space-y-1">
              <div><strong>Class:</strong> {classTitle}</div>
              <div><strong>Studio:</strong> {studioName}</div>
              <div><strong>Date:</strong> {new Date().toLocaleDateString()}</div>
            </div>
          </div>

          {/* Waiver Content */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="font-medium">Liability Waiver & Release</span>
              <Badge variant="outline">Required</Badge>
            </div>

            <ScrollArea className="h-64 w-full border rounded-md p-4">
              <div className="whitespace-pre-line text-sm space-y-3">
                {waiver.content}
              </div>
            </ScrollArea>

            {/* Confirmation of Reading */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="hasRead" 
                checked={hasRead}
                onCheckedChange={setHasRead}
              />
              <Label htmlFor="hasRead" className="text-sm">
                I have read and understood the entire waiver above
              </Label>
            </div>
          </div>

          <Separator />

          {/* Emergency Contact (if required) */}
          {requiresEmergencyContact && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="font-medium">Emergency Contact</span>
                <Badge variant="destructive">Required</Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <Label htmlFor="emergencyName">Full Name</Label>
                  <Input
                    id="emergencyName"
                    value={emergencyContact.name}
                    onChange={(e) => setEmergencyContact(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Phone Number</Label>
                  <Input
                    id="emergencyPhone"
                    value={emergencyContact.phone}
                    onChange={(e) => setEmergencyContact(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+41 XX XXX XX XX"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship">Relationship</Label>
                  <Input
                    id="emergencyRelationship"
                    value={emergencyContact.relationship}
                    onChange={(e) => setEmergencyContact(prev => ({ ...prev, relationship: e.target.value }))}
                    placeholder="e.g., Spouse, Parent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Medical Conditions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">Medical Information</span>
              <Badge variant="outline">Optional</Badge>
            </div>
            <div>
              <Label htmlFor="medicalConditions">
                Please list any medical conditions, injuries, or physical limitations we should be aware of:
              </Label>
              <Input
                id="medicalConditions"
                value={medicalConditions}
                onChange={(e) => setMedicalConditions(e.target.value)}
                placeholder="e.g., Back injury, pregnancy, heart condition (optional)"
              />
            </div>
          </div>

          {/* Digital Signature (if required) */}
          {requiresSignature && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Signature className="h-4 w-4" />
                <span className="font-medium">Digital Signature</span>
                <Badge variant="destructive">Required</Badge>
              </div>
              <div>
                <Label htmlFor="signature">
                  Type your full legal name as your digital signature:
                </Label>
                <Input
                  id="signature"
                  value={signature}
                  onChange={(e) => setSignature(e.target.value)}
                  placeholder="Your full legal name"
                />
              </div>
            </div>
          )}

          <Separator />

          {/* Marketing Consent */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="marketingConsent" 
                checked={consentToMarketing}
                onCheckedChange={setConsentToMarketing}
              />
              <Label htmlFor="marketingConsent" className="text-sm">
                I consent to receive marketing communications from {studioName} about classes, events, and special offers. 
                I can unsubscribe at any time.
              </Label>
            </div>
          </div>

          {/* Final Acceptance */}
          <Alert className={hasRead ? "border-green-200 bg-green-50" : "border-orange-200 bg-orange-50"}>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="finalAccept" 
                checked={hasAccepted}
                onCheckedChange={setHasAccepted}
                disabled={!hasRead}
              />
              <Label htmlFor="finalAccept" className="text-sm font-medium">
                I acknowledge that I have read, understood, and agree to be bound by this waiver and release of liability.
              </Label>
            </div>
            <AlertDescription className="mt-2 text-xs">
              By checking this box, you are providing your electronic signature and agreeing to the terms above.
              This creates a legally binding agreement.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel Booking
            </Button>
            <Button 
              onClick={handleAccept}
              disabled={!isValid}
              className="flex-1"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Accept & Continue to Payment
            </Button>
          </div>

          {/* Legal Notice */}
          <div className="text-xs text-muted-foreground p-3 bg-muted rounded">
            <Clock className="h-3 w-3 inline mr-1" />
            This waiver will be timestamped and stored securely. For questions about this waiver, 
            contact {studioName} directly.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}