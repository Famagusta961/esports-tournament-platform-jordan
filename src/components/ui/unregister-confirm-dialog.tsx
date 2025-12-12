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
import { AlertCircle } from 'lucide-react';

interface UnregisterConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  tournamentTitle: string;
  entryFee: number;
  isUnregistering: boolean;
}

export function UnregisterConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  tournamentTitle,
  entryFee,
  isUnregistering
}: UnregisterConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            Unregister from Tournament
          </AlertDialogTitle>
          <AlertDialogDescription className="text-left space-y-3">
            <p>
              Are you sure you want to unregister from <strong>{tournamentTitle}</strong>?
            </p>
            <div className="space-y-1 text-sm">
              <p>• Your spot will be released to other players</p>
              {entryFee > 0 && (
                <p>• <strong>{entryFee} JD</strong> will be refunded to your wallet</p>
              )}
              <p>• You will need to register again if you want to join later</p>
            </div>
            <p className="text-muted-foreground text-xs mt-3">
              Note: A short cooldown period applies to prevent abuse.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isUnregistering}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isUnregistering}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isUnregistering ? 'Unregistering...' : 'Yes, Unregister'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}