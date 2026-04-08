'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Clock, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useLanguage } from '@/context/language-context';
import { t } from '@/lib/translations';

interface ImageVerificationStatus {
  imageUrl: string;
  verificationStatus: 'REAL' | 'FAKE' | null;
  rejectionReason?: string;
  verifiedAt?: string;
}

interface FarmerImageViewerProps {
  imageUrl: string;
  alt?: string;
  className?: string;
  stageId?: string;
  batchId?: string;
  showVerificationStatus?: boolean;
}

export function FarmerImageViewer({
  imageUrl,
  alt = 'Stage image',
  className = 'w-full h-32 object-cover rounded-lg',
  stageId,
  batchId,
  showVerificationStatus = true,
}: FarmerImageViewerProps) {
  const { language } = useLanguage();
  const [verificationStatus, setVerificationStatus] = useState<ImageVerificationStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [error, setError] = useState(false);
  
  useEffect(() => {
    if (!showVerificationStatus || !stageId) {
      setIsLoading(false);
      return;
    }

    fetchVerificationStatus();
  }, [imageUrl, stageId, showVerificationStatus]);

  const fetchVerificationStatus = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ stageId: stageId! });
      const response = await fetch(`/api/image-verification?${params}`);

      if (response.ok) {
        const data = await response.json();
        const verification = data.verifications?.find(
          (v: any) => v.imageUrl === imageUrl
        );

        if (verification) {
          setVerificationStatus({
            imageUrl: verification.imageUrl,
            verificationStatus: verification.verificationStatus,
            rejectionReason: verification.rejectionReason,
            verifiedAt: verification.verifiedAt,
          });
        } else {
          setVerificationStatus({
            imageUrl,
            verificationStatus: null,
          });
        }
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
          <Clock className="h-3 w-3 mr-1 animate-spin" />
          {t('imageVerification.checking', language)}
        </Badge>
      );
    }

    if (!verificationStatus?.verificationStatus) {
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
          <Clock className="h-3 w-3 mr-1" />
          {t('imageVerification.pendingReview', language)}
        </Badge>
      );
    }

    if (verificationStatus.verificationStatus === 'REAL') {
      return (
        <Badge className="bg-green-600 text-white border-green-400">
          <CheckCircle className="h-3 w-3 mr-1" />
          {t('imageVerification.verified', language)}
        </Badge>
      );
    }

    if (verificationStatus.verificationStatus === 'FAKE') {
      return (
        <Badge className="bg-red-600 text-white border-red-400 cursor-pointer hover:bg-red-700">
          <XCircle className="h-3 w-3 mr-1" />
          {t('imageVerification.flagged', language)}
        </Badge>
      );
    }

    return null;
  };

  const handleImageClick = () => {
    if (verificationStatus?.verificationStatus === 'FAKE') {
      setShowRejectionDialog(true);
    }
  };

  const handleSendAppeal = async () => {
    try {
      // call backend to create appeal + notify admins
      const farmerId = (typeof window !== 'undefined' && localStorage.getItem('krishibarosa-user'))
        ? JSON.parse(localStorage.getItem('krishibarosa-user')!).id
        : undefined;

      console.log('📤 Sending appeal for image:', imageUrl, 'farmerId:', farmerId);

      const res = await fetch('/api/appeals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          verificationId: undefined,
          imageUrl,
          farmerId,
          stageId,
          batchId,
          appealReason: 'Farmer disputes the decision (button tap)'
        })
      });

      const result = await res.json();
      console.log('📥 Appeal response:', result);

      if (!res.ok) {
        console.error('Failed to create appeal:', result);
        toast.error(t('imageVerification.disputeErrorToast', language));
        return;
      }

      console.log('✅ Appeal created! Admin notifications sent:', result.notificationsCreated);
      toast.success(t('imageVerification.disputeSentToast', language));
    } catch (err) {
      console.error('Error sending appeal:', err);
      toast.error(t('imageVerification.disputeErrorToast', language));
    }
  };

  return (
    <>
      <div className="relative group cursor-pointer" onClick={handleImageClick}>
        <img
          src={imageUrl}
          alt={alt}
          className={`${className} ${
            verificationStatus?.verificationStatus === 'FAKE' 
              ? 'ring-2 ring-red-500' 
              : verificationStatus?.verificationStatus === 'REAL'
              ? 'ring-2 ring-green-500'
              : ''
          }`}
          onError={() => setError(true)}
        />

        {/* Verification Status Badge */}
        {showVerificationStatus && (
          <div className="absolute top-2 right-2 z-10">
            {getStatusBadge()}
          </div>
        )}

        {/* Status Icon Overlay */}
        {verificationStatus?.verificationStatus === 'REAL' && (
          <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>
        )}

        {verificationStatus?.verificationStatus === 'FAKE' && (
          <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
            <div className="text-center bg-white/90 p-2 rounded">
              <XCircle className="h-8 w-8 text-red-600 mx-auto mb-1" />
              <p className="text-xs font-semibold text-red-800">Click for details</p>
            </div>
          </div>
        )}
      </div>

      {/* Rejection Reason Dialog */}
      <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
        <DialogContent className="sm:max-w-2xl max-w-[95vw] max-h-[90vh] overflow-y-auto" showCloseButton={true}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              {t('imageVerification.dialogTitle', language)}
            </DialogTitle>
            <DialogDescription>
              {t('imageVerification.dialogDescription', language)}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Image Preview */}
            <div className="relative">
              <img
                src={imageUrl}
                alt={alt}
                className="w-full max-h-48 object-contain rounded-lg border-2 border-red-300"
              />
              <Badge className="absolute top-2 right-2 bg-red-600">
                {t('imageVerification.flagged', language)}
              </Badge>
            </div>

            {/* Rejection Reason */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm font-semibold text-red-900 mb-1">
                {t('imageVerification.adminFeedback', language)}
              </p>
              <p className="text-sm text-red-800">
                {verificationStatus?.rejectionReason || 'No specific reason provided.'}
              </p>
            </div>

            {/* Simple Visual Actions - NO TEXT INPUT */}
            <div className="space-y-2">
              <p className="text-center font-semibold text-gray-900 text-sm">
                {t('imageVerification.whatToDoTitle', language)}
              </p>

              {/* OPTION 1: Accept & Re-upload */}
              <Button
                onClick={() => {
                  setShowRejectionDialog(false);
                  toast.info(t('imageVerification.reuploadToast', language));
                }}
                className="w-full h-14 bg-green-600 hover:bg-green-700 text-base"
              >
                <div className="flex flex-col items-center gap-1">
                  <span>✅ {t('imageVerification.acceptAndReupload', language)}</span>
                  <span className="text-xs opacity-90">{t('imageVerification.acceptSubtext', language)}</span>
                </div>
              </Button>

              {/* OPTION 2: Dispute - Admin Made Mistake */}
              <Button
                onClick={async () => {
                  setShowRejectionDialog(false);
                  await handleSendAppeal();
                }}
                variant="outline"
                className="w-full h-14 border-2 border-orange-500 text-orange-700 hover:bg-orange-50 text-base"
              >
                <div className="flex flex-col items-center gap-1">
                  <span>❌ {t('imageVerification.disputeDecision', language)}</span>
                  <span className="text-xs opacity-90">{t('imageVerification.disputeSubtext', language)}</span>
                </div>
              </Button>

              {/* OPTION 3: Close */}
              <Button
                variant="ghost"
                onClick={() => setShowRejectionDialog(false)}
                className="w-full text-sm"
              >
                {t('imageVerification.decideLater', language)}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
