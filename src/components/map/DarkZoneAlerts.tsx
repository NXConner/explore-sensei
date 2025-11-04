import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DarkZoneAlertsProps {
  isOpen: boolean;
  onClose: () => void;
  onProceed: () => void;
  zoneName?: string;
  riskLevel?: 'low' | 'medium' | 'high';
}

export const DarkZoneAlerts: React.FC<DarkZoneAlertsProps> = ({
  isOpen,
  onClose,
  onProceed,
  zoneName = 'Unknown Zone',
  riskLevel = 'medium'
}) => {
  const riskColors = {
    low: 'text-yellow-500',
    medium: 'text-orange-500',
    high: 'text-destructive'
  };

  const riskMessages = {
    low: 'This area has minimal restrictions. Proceed with standard caution.',
    medium: 'This area requires special attention. Verify permissions before proceeding.',
    high: 'This area has strict restrictions. Contact supervisor before proceeding.'
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangle className={`icon-lg ${riskColors[riskLevel]}`} />
            Dark Zone Overlap Detected
          </AlertDialogTitle>
          <AlertDialogDescription>
            Your measurement overlaps with: <strong>{zoneName}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Alert>
          <AlertDescription className={riskColors[riskLevel]}>
            {riskMessages[riskLevel]}
          </AlertDescription>
        </Alert>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onClose}>Relocate Measurement</AlertDialogCancel>
          <AlertDialogAction onClick={onProceed}>
            Proceed Anyway
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
