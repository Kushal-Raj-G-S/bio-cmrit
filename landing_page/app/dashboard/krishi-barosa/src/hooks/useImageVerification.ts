import { useState, useCallback } from 'react';
import { toast } from 'sonner';

export type VerificationStatus = 'REAL' | 'FAKE' | null;

export interface ImageVerification {
  id: string;
  imageUrl: string;
  verificationStatus: VerificationStatus;
  rejectionReason?: string; // Admin's reason when marking as FAKE
  verifiedBy?: string;
  verifiedAt?: Date;
  stageId: string;
  batchId: string;
  farmerId: string;
  verifier?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface UseImageVerificationProps {
  stageId?: string;
  batchId?: string;
  adminId: string;
}

export const useImageVerification = ({ stageId, batchId, adminId }: UseImageVerificationProps) => {
  const [verifications, setVerifications] = useState<Map<string, ImageVerification>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch image verifications
  const fetchVerifications = useCallback(async () => {
    if (!stageId && !batchId) return;

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (stageId) params.append('stageId', stageId);
      if (batchId) params.append('batchId', batchId);

      const response = await fetch(`/api/image-verification?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch verifications');
      }

      const data = await response.json();
      const verificationsMap = new Map<string, ImageVerification>();
      
      data.verifications.forEach((verification: ImageVerification) => {
        verificationsMap.set(verification.imageUrl, verification);
      });

      setVerifications(verificationsMap);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('⚠️ Failed to load verification data');
    } finally {
      setIsLoading(false);
    }
  }, [stageId, batchId]);

  // Update image verification with optimistic UI
  const updateImageVerification = useCallback(async (
    imageUrl: string,
    status: 'REAL' | 'FAKE',
    stageIdParam: string,
    batchIdParam: string,
    farmerIdParam: string,
    rejectionReason?: string // Optional rejection reason for FAKE status
  ) => {
    setIsUpdating(true);

    // Optimistic update
    const optimisticVerification: ImageVerification = {
      id: `temp-${Date.now()}`,
      imageUrl,
      verificationStatus: status,
      rejectionReason: status === 'FAKE' ? rejectionReason : undefined,
      verifiedBy: adminId,
      verifiedAt: new Date(),
      stageId: stageIdParam,
      batchId: batchIdParam,
      farmerId: farmerIdParam
    };

    setVerifications(prev => new Map(prev.set(imageUrl, optimisticVerification)));

    try {
      const response = await fetch('/api/image-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl,
          verificationStatus: status,
          rejectionReason: status === 'FAKE' ? rejectionReason : undefined,
          stageId: stageIdParam,
          batchId: batchIdParam,
          farmerId: farmerIdParam,
          verifiedBy: adminId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update verification');
      }

      const data = await response.json();
      
      // Update with actual data from server
      setVerifications(prev => new Map(prev.set(imageUrl, data.verification)));
      
      // Success toast
      const message = status === 'REAL' ? '✅ Marked as Real' : '❌ Marked as Fake';
      toast.success(message);

    } catch (error) {
      console.error('Error updating verification:', error);
      
      // Revert optimistic update on error
      setVerifications(prev => {
        const newMap = new Map(prev);
        newMap.delete(imageUrl);
        return newMap;
      });
      
      toast.error('⚠️ Failed to update. Try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [adminId]);

  // Reset verification status
  const resetVerification = useCallback(async (imageUrl: string, stageIdParam: string) => {
    setIsUpdating(true);

    // Optimistic removal
    const previousVerification = verifications.get(imageUrl);
    setVerifications(prev => {
      const newMap = new Map(prev);
      newMap.delete(imageUrl);
      return newMap;
    });

    try {
      const params = new URLSearchParams({
        imageUrl,
        stageId: stageIdParam
      });

      const response = await fetch(`/api/image-verification?${params}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to reset verification');
      }

      toast.success('🔄 Verification reset');

    } catch (error) {
      console.error('Error resetting verification:', error);
      
      // Revert optimistic update on error
      if (previousVerification) {
        setVerifications(prev => new Map(prev.set(imageUrl, previousVerification)));
      }
      
      toast.error('⚠️ Failed to reset. Try again.');
    } finally {
      setIsUpdating(false);
    }
  }, [verifications]);

  // Get verification status for a specific image
  const getVerificationStatus = useCallback((imageUrl: string): VerificationStatus => {
    return verifications.get(imageUrl)?.verificationStatus ?? null;
  }, [verifications]);

  // Check if image is verified as real
  const isImageReal = useCallback((imageUrl: string): boolean => {
    return getVerificationStatus(imageUrl) === 'REAL';
  }, [getVerificationStatus]);

  // Check if image is marked as fake
  const isImageFake = useCallback((imageUrl: string): boolean => {
    return getVerificationStatus(imageUrl) === 'FAKE';
  }, [getVerificationStatus]);

  return {
    verifications: Array.from(verifications.values()),
    isLoading,
    isUpdating,
    fetchVerifications,
    updateImageVerification,
    resetVerification,
    getVerificationStatus,
    isImageReal,
    isImageFake
  };
};
