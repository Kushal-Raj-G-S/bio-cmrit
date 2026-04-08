'use client';

import { useState, useEffect } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  MapPin, 
  Calendar, 
  ChevronDown,
  ChevronRight,
  Wheat, 
  Package,
  CheckCircle,
  XCircle,
  TrendingUp,
  User,
  RotateCcw,
  Download,
  Brain,
  Sparkles,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/auth-context';
import { useImageVerification, type VerificationStatus } from '@/hooks/useImageVerification';
import { QRGenerator } from '@/components/shared/qr-generator';
import QRCode from 'qrcode';

// AI Validation Display Component
const AIValidationBadge = ({ aiValidation }: { aiValidation: any }) => {
  if (!aiValidation) return null;

  const getActionColor = (action: string) => {
    switch (action) {
      case 'AUTO_APPROVE':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'AUTO_REJECT':
        return 'bg-red-50 text-red-700 border-red-300';
      case 'FLAG_FOR_HUMAN':
        return 'bg-yellow-50 text-yellow-700 border-yellow-300';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-300';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'AUTO_APPROVE':
        return <CheckCircle className="h-3 w-3" />;
      case 'AUTO_REJECT':
        return <XCircle className="h-3 w-3" />;
      case 'FLAG_FOR_HUMAN':
        return <AlertTriangle className="h-3 w-3" />;
      default:
        return <Brain className="h-3 w-3" />;
    }
  };

  const formatScore = (score: number | null) => {
    if (score === null || score === undefined) return 'N/A';
    // Handle both 0-1 range and 0-100 range
    const normalizedScore = score > 1 ? score : score * 100;
    return `${Math.round(normalizedScore)}%`;
  };

  return (
    <div className="mt-2 p-2 rounded-lg bg-white/90 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-1 mb-1">
        <Brain className="h-3 w-3 text-purple-600" />
        <span className="text-xs font-semibold text-gray-700">AI Analysis</span>
      </div>
      
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600">Authenticity:</span>
          <span className={`font-medium ${
            (aiValidation.deepfakeScore || 0) < 0.3 ? 'text-green-600' : 
            (aiValidation.deepfakeScore || 0) > 0.85 ? 'text-red-600' : 
            'text-yellow-600'
          }`}>
            {formatScore(1 - (aiValidation.deepfakeScore || 0))}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-600">Visual Quality:</span>
          <span className="font-medium text-blue-600">
            {formatScore(aiValidation.visualSenseScore || 0)}
          </span>
        </div>
        
        <div className={`flex items-center gap-1 mt-2 px-2 py-1 rounded ${getActionColor(aiValidation.aiAction)}`}>
          {getActionIcon(aiValidation.aiAction)}
          <span className="text-xs font-medium">
            {aiValidation.aiAction === 'AUTO_APPROVE' && 'AI: Approve'}
            {aiValidation.aiAction === 'AUTO_REJECT' && 'AI: Reject'}
            {aiValidation.aiAction === 'FLAG_FOR_HUMAN' && 'AI: Needs Review'}
          </span>
        </div>
        
        {aiValidation.aiReason && (
          <p className="text-xs text-gray-500 italic mt-1 break-words">
            {aiValidation.aiReason}
          </p>
        )}
      </div>
    </div>
  );
};

// Enhanced component to display batch/stage images with admin verification features
const StageImage = ({ 
  src, 
  alt = "Crop image", 
  className = "w-full h-32 object-cover rounded-lg",
  showVerificationControls = false,
  imageIndex,
  stageId,
  batchId,
  farmerId,
  onVerificationUpdate,
  initialVerificationStatus,
  aiValidation
}: { 
  src: string; 
  alt?: string; 
  className?: string;
  showVerificationControls?: boolean;
  imageIndex?: number;
  stageId?: string;
  batchId?: string;
  farmerId?: string;
  onVerificationUpdate?: () => void;
  initialVerificationStatus?: VerificationStatus;
  aiValidation?: any;
}) => {
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [localVerificationStatus, setLocalVerificationStatus] = useState<VerificationStatus>(initialVerificationStatus || null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { user } = useAuth();

  // Debug: Log user role to see why verification controls aren't showing
  console.log('StageImage user role:', user?.role, 'showVerificationControls:', showVerificationControls);

  // Update local status when prop changes
  React.useEffect(() => {
    setLocalVerificationStatus(initialVerificationStatus || null);
  }, [initialVerificationStatus]);

  // Check if the src is an SVG string (base64 or direct SVG)
  const isSvgString = src.includes('<svg') || src.startsWith('data:image/svg+xml');
  
  // Check if image is from Supabase (real image) or demo/fake
  const isSupabaseImage = src.includes('supabase') || src.includes('storage');

  // Handle verification actions
  const handleVerifyAsReal = async () => {
    if (!stageId || !batchId || !farmerId || !user?.id) return;
    
    try {
      setIsUpdating(true);
      
      const response = await fetch('/api/image-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: src,
          verificationStatus: 'REAL',
          stageId,
          batchId,
          farmerId,
          verifiedBy: user.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify image');
      }

      // Update local state immediately
      setLocalVerificationStatus('REAL');
      toast.success('Image verified as authentic');
      
      // Notify parent component
      onVerificationUpdate?.();
    } catch (error) {
      console.error('Error verifying image:', error);
      toast.error('Failed to verify image');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleVerifyAsFake = async () => {
    if (!stageId || !batchId || !farmerId || !user?.id) return;
    
    // Open dialog to get rejection reason
    setShowRejectionDialog(true);
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a reason for flagging this image');
      return;
    }
    
    try {
      setIsUpdating(true);
      setShowRejectionDialog(false);
      
      const response = await fetch('/api/image-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: src,
          verificationStatus: 'FAKE',
          rejectionReason: rejectionReason.trim(),
          stageId,
          batchId,
          farmerId,
          verifiedBy: user!.id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to flag image');
      }

      // Update local state immediately
      setLocalVerificationStatus('FAKE');
      toast.success('Image flagged as fake with reason');
      setRejectionReason(''); // Clear for next time
      
      // Notify parent component
      onVerificationUpdate?.();
    } catch (error) {
      console.error('Error flagging image:', error);
      toast.error('Failed to flag image');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResetVerification = async () => {
    if (!stageId || !user?.id) return;
    
    try {
      setIsUpdating(true);
      
      // Use URL parameters instead of JSON body for DELETE request
      const params = new URLSearchParams({
        imageUrl: src,
        stageId
      });
      
      const response = await fetch(`/api/image-verification?${params}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to reset verification');
      }

      // Update local state immediately
      setLocalVerificationStatus(null);
      toast.success('Verification reset');
      
      // Notify parent component
      onVerificationUpdate?.();
    } catch (error) {
      console.error('Error resetting verification:', error);
      toast.error('Failed to reset verification');
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper functions for verification status
  const isVerifiedReal = localVerificationStatus === 'REAL';
  const isVerifiedFake = localVerificationStatus === 'FAKE';

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">Image unavailable</span>
      </div>
    );
  }

  if (isSvgString) {
    // Handle SVG strings - decode if base64, render directly if not
    let svgContent = src;
    if (src.startsWith('data:image/svg+xml;base64,')) {
      try {
        svgContent = atob(src.split(',')[1]);
      } catch (e) {
        console.error('Failed to decode SVG:', e);
        setError(true);
        return null;
      }
    }

    return (
      <div className={`relative cursor-pointer ${className}`} onClick={() => setShowImageModal(true)}>
        <div 
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="w-full h-full"
        />
        
        {/* Verification overlays for SVG images */}
        {isVerifiedReal && (
          <div 
            className="absolute top-2 left-2 bg-green-600 text-white rounded-full p-1 shadow-md"
            title="Verified as Real"
          >
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
        
        {isVerifiedFake && (
          <div 
            className="absolute top-2 left-2 bg-red-600 text-white rounded-full p-1 shadow-md"
            title="Rejected as Fake"
          >
            <XCircle className="h-4 w-4" />
          </div>
        )}

        {/* Admin verification controls */}
        {showVerificationControls && (user?.role?.toUpperCase() === 'ADMIN') && (
          <div className="absolute bottom-2 right-2 flex gap-1 z-10 bg-white/90 p-1 rounded-lg shadow-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVerifyAsReal();
              }}
              disabled={isUpdating}
              className={`p-2 rounded-md text-xs transition-all duration-200 shadow-md ${
                isVerifiedReal 
                  ? "bg-green-600 text-white border-2 border-green-400" 
                  : "bg-green-500 hover:bg-green-600 text-white hover:scale-110"
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Mark as Authentic"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVerifyAsFake();
              }}
              disabled={isUpdating}
              className={`p-2 rounded-md text-xs transition-all duration-200 shadow-md ${
                isVerifiedFake 
                  ? "bg-red-600 text-white border-2 border-red-400" 
                  : "bg-red-500 hover:bg-red-600 text-white hover:scale-110"
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Mark as Fake"
            >
              <XCircle className="h-4 w-4" />
            </button>
            {localVerificationStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetVerification();
                }}
                disabled={isUpdating}
                className={`p-2 rounded-md text-xs transition-all duration-200 shadow-md bg-gray-500 hover:bg-gray-600 text-white hover:scale-110 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Reset Verification"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Handle regular image URLs (Supabase Storage)
  return (
    <>
      <div className={`relative cursor-pointer ${className}`} onClick={() => setShowImageModal(true)}>
        {isLoading && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-sm">Loading...</span>
          </div>
        )}
        <img
          src={src}
          alt={alt}
          className={className}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
        />
        
        {/* Image type badge - only show for Supabase images */}
        {/* Removed "Real Image" badge - confusing for users */}

        {/* Verification status overlays */}
        {isVerifiedReal && (
          <div 
            className="absolute top-2 right-2 bg-green-600 text-white rounded-full p-1 shadow-md z-10"
            title="Verified as Real"
          >
            <CheckCircle className="h-4 w-4" />
          </div>
        )}
        
        {isVerifiedFake && (
          <div 
            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 shadow-md z-10"
            title="Rejected as Fake"
          >
            <XCircle className="h-4 w-4" />
          </div>
        )}

        {/* Admin verification controls */}
        {showVerificationControls && (user?.role?.toUpperCase() === 'ADMIN') && (
          <div className="absolute bottom-2 right-2 flex gap-1 z-10 bg-white/90 p-1 rounded-lg shadow-lg">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVerifyAsReal();
              }}
              disabled={isUpdating}
              className={`p-2 rounded-md text-xs transition-all duration-200 shadow-md ${
                isVerifiedReal 
                  ? "bg-green-600 text-white border-2 border-green-400" 
                  : "bg-green-500 hover:bg-green-600 text-white hover:scale-110"
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Mark as Authentic"
            >
              <CheckCircle className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleVerifyAsFake();
              }}
              disabled={isUpdating}
              className={`p-2 rounded-md text-xs transition-all duration-200 shadow-md ${
                isVerifiedFake 
                  ? "bg-red-600 text-white border-2 border-red-400" 
                  : "bg-red-500 hover:bg-red-600 text-white hover:scale-110"
              } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Mark as Fake"
            >
              <XCircle className="h-4 w-4" />
            </button>
            {localVerificationStatus && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleResetVerification();
                }}
                disabled={isUpdating}
                className={`p-2 rounded-md text-xs transition-all duration-200 shadow-md bg-gray-500 hover:bg-gray-600 text-white hover:scale-110 ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Reset Verification"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {showImageModal && (
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Image Details</DialogTitle>
              <DialogDescription>
                {alt} - Click outside to close
              </DialogDescription>
            </DialogHeader>
            <div className="relative max-h-[50vh] overflow-hidden rounded-lg flex items-center justify-center bg-gray-50">
              <img
                src={src}
                alt={alt}
                className="max-w-full max-h-[50vh] object-contain rounded-lg"
              />
            </div>
            
            {/* AI Validation Details in Modal */}
            {aiValidation && (
              <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-3">
                  <Brain className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-purple-900">AI Validation Results</h4>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Authenticity Score:</span>
                    <p className={`font-semibold ${
                      (aiValidation.deepfakeScore || 0) < 0.3 ? 'text-green-600' : 
                      (aiValidation.deepfakeScore || 0) > 0.85 ? 'text-red-600' : 
                      'text-yellow-600'
                    }`}>
                      {Math.round((1 - (aiValidation.deepfakeScore || 0)) * 100)}% Real
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Visual Quality:</span>
                    <p className="font-semibold text-blue-600">
                      {Math.round((aiValidation.visualSenseScore || 0) * 100)}%
                    </p>
                  </div>
                </div>
                {aiValidation.aiReason && (
                  <div className="mt-3">
                    <span className="text-gray-600 text-sm">AI Reasoning:</span>
                    <p className="text-gray-700 mt-1 italic">{aiValidation.aiReason}</p>
                  </div>
                )}
                <Badge className={`mt-3 ${
                  aiValidation.aiAction === 'AUTO_APPROVE' ? 'bg-green-600' :
                  aiValidation.aiAction === 'AUTO_REJECT' ? 'bg-red-600' :
                  'bg-yellow-600'
                }`}>
                  {aiValidation.aiAction === 'AUTO_APPROVE' && '✓ AI Recommends: Approve'}
                  {aiValidation.aiAction === 'AUTO_REJECT' && '✗ AI Recommends: Reject'}
                  {aiValidation.aiAction === 'FLAG_FOR_HUMAN' && '⚠ AI Recommends: Human Review'}
                </Badge>
              </div>
            )}
            
            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-2">
                {/* Removed "Real Image" badge - only show admin verification status */}
                
                {/* Verification status badges */}
                {isVerifiedReal && (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Admin Verified
                  </Badge>
                )}
                
                {isVerifiedFake && (
                  <Badge className="bg-red-600 text-white">
                    <XCircle className="h-3 w-3 mr-1" />
                    Admin Flagged
                  </Badge>
                )}
              </div>
              
              {/* Admin controls in modal */}
              {showVerificationControls && (user?.role?.toUpperCase() === 'ADMIN') && (
                <div className="flex gap-2">
                  <Button
                    onClick={handleVerifyAsReal}
                    disabled={isUpdating}
                    className={`transition-all ${
                      isVerifiedReal 
                        ? "bg-green-600 hover:bg-green-700" 
                        : "bg-green-500 hover:bg-green-600"
                    } text-white`}
                    size="sm"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verify
                  </Button>
                  <Button
                    onClick={handleVerifyAsFake}
                    disabled={isUpdating}
                    className={`transition-all ${
                      isVerifiedFake 
                        ? "bg-red-600 hover:bg-red-700" 
                        : "bg-red-500 hover:bg-red-600"
                    } text-white`}
                    size="sm"
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Fake
                  </Button>
                  {localVerificationStatus && (
                    <Button
                      onClick={handleResetVerification}
                      disabled={isUpdating}
                      variant="outline"
                      size="sm"
                    >
                      <RotateCcw className="h-3 w-3 mr-1" />
                      Reset
                    </Button>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Rejection Reason Dialog */}
      {showRejectionDialog && (
        <Dialog open={showRejectionDialog} onOpenChange={setShowRejectionDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Flag Image as Fake</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this image. The farmer will see this explanation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="rejection-reason">Rejection Reason *</Label>
                <Textarea
                  id="rejection-reason"
                  placeholder="E.g., Stock image detected, Not from actual farm location, AI generated content, Wrong crop stage, etc."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="min-h-[100px]"
                />
                <p className="text-xs text-gray-500">
                  Be specific to help the farmer understand the issue and reupload correct images.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setShowRejectionDialog(false);
                  setRejectionReason('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={submitRejection}
                disabled={!rejectionReason.trim() || isUpdating}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {isUpdating ? 'Submitting...' : 'Flag as Fake'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

// Interface for farming stages
interface Stage {
  id?: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  imageUrls: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for farmer user accounts
interface FarmerUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  createdAt: Date;
}

// Interface for batch data - updated to match farmer dashboard
interface BatchData {
  id: string;
  batchCode?: string;
  name: string;
  category: string;
  area?: number;
  quantity?: number;
  unit?: string;
  location?: string | { lat: number; lng: number; address: string };
  plantingDate?: Date;
  sowingDate?: Date;
  expectedHarvestDate?: Date;
  actualHarvestDate?: Date;
  description: string;
  fertilizers?: string;
  pesticides?: string;
  images?: string[];  // Deprecated - use imageUrls
  imageUrls?: string[];  // Supabase Storage URLs
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ACTIVE' | 'CERTIFIED';
  verified?: boolean;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: Date;
  verifiedBy?: string;
  qrCode?: string;
  certificate_id?: string; // Blockchain certificate ID
  createdAt: Date;
  updatedAt: Date;
  farmerId: string;
}

// Combined interface for farmer with their batches
interface FarmerWithBatches {
  farmer: FarmerUser;
  batches: BatchData[];
}

export function FarmerDashboardAdmin(): React.JSX.Element {
  const { user } = useAuth();
  const router = useRouter();
  
  // State for component
  const [allBatches, setAllBatches] = useState<BatchData[]>([]);
  const [farmersWithBatches, setFarmersWithBatches] = useState<FarmerWithBatches[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<BatchData | null>(null);
  const [batchStages, setBatchStages] = useState<Stage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isLoadingStages, setIsLoadingStages] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState<boolean>(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState<boolean>(false);
  const [expandedFarmers, setExpandedFarmers] = useState<Set<string>>(new Set());
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(new Set());
  
  // State to store verification statuses for all images
  const [imageVerificationMap, setImageVerificationMap] = useState<Map<string, VerificationStatus>>(new Map());
  
  // State to store AI validation data for all images
  const [aiValidationMap, setAiValidationMap] = useState<Map<string, any>>(new Map());
  
  // State for QR code display
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  
  // Generate QR code when batch has qr_code URL
  const generateQRCode = async (qrUrl: string) => {
    try {
      const qrDataURL = await QRCode.toDataURL(qrUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeImage(qrDataURL);
    } catch (error) {
      console.error('QR code generation failed:', error);
    }
  };

  // Initialize verification hook for the selected batch
  const {
    verifications,
    fetchVerifications,
    updateImageVerification,
    resetVerification,
    getVerificationStatus,
    isImageReal,
    isImageFake,
    isLoading: isLoadingVerifications
  } = useImageVerification({
    batchId: selectedBatch?.id,
    adminId: user?.id || ''
  });
  
  // Farming stages definition (matching farmer dashboard)
  const farmingStages = [
    'Land Preparation',
    'Sowing',
    'Germination',
    'Vegetative Growth',
    'Flowering & Pollination',
    'Harvesting',
    'Post-Harvest Processing'
  ];
  
  // Function to fetch verification statuses for a batch
  const fetchBatchVerifications = async (batchId: string) => {
    try {
      const response = await fetch(`/api/image-verification?batchId=${batchId}`);
      if (response.ok) {
        const data = await response.json();
        const newVerificationMap = new Map<string, VerificationStatus>();
        
        data.verifications.forEach((verification: any) => {
          newVerificationMap.set(verification.imageUrl, verification.verificationStatus);
        });
        
        setImageVerificationMap(newVerificationMap);
      }
    } catch (error) {
      console.error('Error fetching batch verifications:', error);
    }
  };

  // Function to fetch AI validation data for batch images
  const fetchBatchAIValidations = async (imageUrls: string[]) => {
    if (!imageUrls || imageUrls.length === 0) return;
    
    try {
      const response = await fetch(`/api/ai-validation?imageUrls=${imageUrls.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        const newAiValidationMap = new Map<string, any>();
        
        Object.entries(data.validations).forEach(([imageUrl, validation]) => {
          newAiValidationMap.set(imageUrl, validation);
        });
        
        setAiValidationMap(newAiValidationMap);
      }
    } catch (error) {
      console.error('Error fetching AI validations:', error);
    }
  };

  // Helper function to safely render location
  const getLocationDisplay = (location: string | { lat: number; lng: number; address: string }): string => {
    if (typeof location === 'string') {
      return location;
    }
    if (location && typeof location === 'object' && 'address' in location) {
      return location.address || `${location.lat}, ${location.lng}`;
    }
    return 'Location not specified';
  };

  // Fetch all farmers and their batches on component mount
  useEffect(() => {
    const fetchFarmersAndBatches = async () => {
      try {
        setIsLoading(true);
        
        // Fetch all batches
        const batchesResponse = await fetch('/api/batches');
        if (!batchesResponse.ok) {
          throw new Error('Failed to fetch batches');
        }
        const batchesData = await batchesResponse.json();
        
        // Transform batch dates
        const transformedBatches = batchesData.map((batch: BatchData) => ({
          ...batch,
          plantingDate: batch.plantingDate ? new Date(batch.plantingDate) : new Date(batch.createdAt),
          sowingDate: batch.sowingDate ? new Date(batch.sowingDate) : undefined,
          expectedHarvestDate: batch.expectedHarvestDate ? new Date(batch.expectedHarvestDate) : new Date(),
          actualHarvestDate: batch.actualHarvestDate ? new Date(batch.actualHarvestDate) : undefined,
          createdAt: new Date(batch.createdAt),
          updatedAt: new Date(batch.updatedAt),
          verifiedAt: batch.verifiedAt ? new Date(batch.verifiedAt) : undefined
        }));
        
        setAllBatches(transformedBatches);
        
        // Fetch all farmer users
        const farmersResponse = await fetch('/api/users?role=farmer');
        if (!farmersResponse.ok) {
          throw new Error('Failed to fetch farmers');
        }
        const farmersData = await farmersResponse.json();
        
        // Create farmers with batches array
        const farmersWithBatchesData: FarmerWithBatches[] = farmersData.map((farmer: FarmerUser) => {
          const farmerBatches = transformedBatches.filter((batch: BatchData) => batch.farmerId === farmer.id);
          return {
            farmer: {
              ...farmer,
              createdAt: new Date(farmer.createdAt)
            },
            batches: farmerBatches
          };
        }).filter((farmerData: FarmerWithBatches) => farmerData.batches.length > 0); // Only show farmers with batches
        
        // Sort farmers alphabetically by name
        farmersWithBatchesData.sort((a, b) => a.farmer.name.localeCompare(b.farmer.name));
        setFarmersWithBatches(farmersWithBatchesData);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load farmer data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFarmersAndBatches();
  }, []);

  // Toggle farmer expansion
  const toggleFarmerExpansion = (farmerId: string): void => {
    setExpandedFarmers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(farmerId)) {
        newSet.delete(farmerId);
      } else {
        newSet.add(farmerId);
      }
      return newSet;
    });
  };

  // Fetch stages for a batch
  const fetchStages = async (batchId: string) => {
    try {
      setIsLoadingStages(true);
      const response = await fetch(`/api/stages?batchId=${batchId}`);
      if (response.ok) {
        const data = await response.json();
        setBatchStages(data);
        
        // Extract all image URLs from stages and fetch AI validations
        const allImageUrls: string[] = [];
        data.forEach((stage: Stage) => {
          if (stage.imageUrls && stage.imageUrls.length > 0) {
            allImageUrls.push(...stage.imageUrls);
          }
        });
        
        if (allImageUrls.length > 0) {
          fetchBatchAIValidations(allImageUrls);
        }
      } else {
        setBatchStages([]);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
      setBatchStages([]);
    } finally {
      setIsLoadingStages(false);
    }
  };

  // Effect to fetch verifications when batch is selected
  useEffect(() => {
    if (selectedBatch?.id) {
      fetchVerifications();
    }
  }, [selectedBatch?.id, fetchVerifications]);

  // Get organized stages with proper ordering
  const getOrganizedStages = () => {
    const organizedStages = farmingStages.map(stageName => {
      const existingStage = batchStages.find(s => s.name === stageName);
      return existingStage || {
        name: stageName,
        status: 'PENDING' as const,
        notes: '',
        imageUrls: []
      };
    });
    return organizedStages;
  };

  // Handle view batch details
  const handleViewBatch = async (batch: BatchData): Promise<void> => {
    // Fetch fresh batch data from database to get latest QR code
    try {
      const response = await fetch(`/api/batches?batchId=${batch.id}`);
      if (response.ok) {
        const freshBatches = await response.json();
        let freshBatch = freshBatches.find((b: BatchData) => b.id === batch.id) || batch;
        
        // Transform date strings to Date objects
        freshBatch = {
          ...freshBatch,
          plantingDate: freshBatch.plantingDate ? new Date(freshBatch.plantingDate) : new Date(freshBatch.createdAt),
          sowingDate: freshBatch.sowingDate ? new Date(freshBatch.sowingDate) : undefined,
          expectedHarvestDate: freshBatch.expectedHarvestDate ? new Date(freshBatch.expectedHarvestDate) : new Date(),
          actualHarvestDate: freshBatch.actualHarvestDate ? new Date(freshBatch.actualHarvestDate) : undefined,
          createdAt: new Date(freshBatch.createdAt),
          updatedAt: new Date(freshBatch.updatedAt),
          verifiedAt: freshBatch.verifiedAt ? new Date(freshBatch.verifiedAt) : undefined
        };
        
        setSelectedBatch(freshBatch);
        
        // Generate QR code ONLY if blockchain certificate exists
        if (freshBatch.certificate_id && freshBatch.qrCode) {
          generateQRCode(freshBatch.qrCode);
        } else {
          setQrCodeImage(null); // Reset if no blockchain certificate
        }
      } else {
        setSelectedBatch(batch);
        setQrCodeImage(null);
      }
    } catch (error) {
      console.error('Error fetching fresh batch data:', error);
      setSelectedBatch(batch);
      setQrCodeImage(null);
    }
    
    setIsBatchDialogOpen(true);
    // Fetch stages for this batch
    fetchStages(batch.id);
    // Fetch verification statuses for this batch
    fetchBatchVerifications(batch.id);
  };

  // Handle batch verification (verify/reject)
  const handleVerifyBatch = async (batchId: string, verified: boolean): Promise<void> => {
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/batches', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId,
          verified,
          adminId: user.id
        }),
      });

      if (response.ok) {
        const updatedBatch = await response.json();
        
        // Update all batches state
        setAllBatches(prevBatches => 
          prevBatches.map(batch => 
            batch.id === batchId 
              ? { 
                  ...batch, 
                  verified: updatedBatch.verified,
                  status: updatedBatch.verified ? 'VERIFIED' : 'REJECTED',
                  verificationStatus: updatedBatch.verified ? 'VERIFIED' : 'REJECTED',
                  verifiedAt: updatedBatch.verifiedAt ? new Date(updatedBatch.verifiedAt) : undefined,
                  verifiedBy: updatedBatch.verifiedBy
                }
              : batch
          )
        );
        
        // Update farmers with batches state
        setFarmersWithBatches(prevFarmers => 
          prevFarmers.map(farmerData => ({
            ...farmerData,
            batches: farmerData.batches.map(batch =>
              batch.id === batchId
                ? {
                    ...batch,
                    verified: updatedBatch.verified,
                    status: updatedBatch.verified ? 'VERIFIED' : 'REJECTED',
                    verificationStatus: updatedBatch.verified ? 'VERIFIED' : 'REJECTED',
                    verifiedAt: updatedBatch.verifiedAt ? new Date(updatedBatch.verifiedAt) : undefined,
                    verifiedBy: updatedBatch.verifiedBy
                  }
                : batch
            )
          }))
        );
        
        // Update selected batch if it's currently viewed
        if (selectedBatch?.id === batchId) {
          setSelectedBatch({
            ...selectedBatch,
            verified: updatedBatch.verified,
            status: updatedBatch.verified ? 'VERIFIED' : 'REJECTED',
            verificationStatus: updatedBatch.verified ? 'VERIFIED' : 'REJECTED',
            verifiedAt: updatedBatch.verifiedAt ? new Date(updatedBatch.verifiedAt) : undefined,
            verifiedBy: updatedBatch.verifiedBy
          });
        }
        
        toast.success(`Batch ${verified ? 'verified' : 'rejected'} successfully!`);
        setIsBatchDialogOpen(false);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to update batch verification');
      }
    } catch (error) {
      console.error('Error updating batch verification:', error);
      toast.error('Failed to update batch verification');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate statistics - FIXED: Only count explicitly rejected batches
  const totalBatches = allBatches.length;
  const pendingBatches = allBatches.filter(batch => 
    batch.verificationStatus === 'PENDING' || 
    batch.verificationStatus === null || 
    batch.verificationStatus === undefined
  ).length;
  const verifiedBatches = allBatches.filter(batch => 
    batch.verificationStatus === 'VERIFIED'
  ).length;
  const rejectedBatches = allBatches.filter(batch => 
    batch.verificationStatus === 'REJECTED'
  ).length;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header - NO CREATE BATCH BUTTON */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Wheat className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-5xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight mb-2">
              Batch Verification Dashboard
            </h1>
            <p className="text-slate-600 font-medium tracking-wide">Review and verify farmer crop batches</p>
          </div>
        </div>
      </div>

      {/* Statistics Cards - Total, Pending, Verified, Rejected */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Batches</p>
                <p className="text-3xl font-black text-blue-700">{totalBatches}</p>
              </div>
              <div className="p-3 bg-blue-200 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-yellow-100 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Pending</p>
                <p className="text-3xl font-black text-yellow-700">{pendingBatches}</p>
              </div>
              <div className="p-3 bg-yellow-200 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Verified</p>
                <p className="text-3xl font-black text-green-700">{verifiedBatches}</p>
              </div>
              <div className="p-3 bg-green-200 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100 hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 font-medium">Rejected</p>
                <p className="text-3xl font-black text-red-700">{rejectedBatches}</p>
              </div>
              <div className="p-3 bg-red-200 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Batch Verification Section - Replaces "My Batches" */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Wheat className="h-6 w-6 text-green-600" />
            <span className="text-3xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight">
              Batch Verification Section
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <span className="ml-2 text-slate-600">Loading farmer data...</span>
            </div>
          ) : farmersWithBatches.length === 0 ? (
            <div className="text-center py-8">
              <User className="h-12 w-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No farmers found</p>
              <p className="text-slate-500 text-sm">Farmers will appear here when they create batches</p>
            </div>
          ) : (
            <div className="space-y-4">
              {farmersWithBatches.map(({ farmer, batches }) => (
                <div key={farmer.id} className="border-2 border-slate-100 rounded-2xl overflow-hidden hover:border-green-200 transition-all duration-200">
                  {/* Farmer Header - Name on left, Chevron on right */}
                  <div 
                    className="bg-gray-50 p-6 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleFarmerExpansion(farmer.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div>
                          <h3 className="font-black text-xl text-slate-800">{farmer.name}</h3>
                          <p className="text-sm text-slate-600 font-medium">{farmer.email}</p>
                          {farmer.phone && (
                            <p className="text-sm text-slate-500">{farmer.phone}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1 font-semibold">
                          {batches.length} batch{batches.length !== 1 ? 'es' : ''}
                        </Badge>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 font-semibold">
                          {batches.filter(b => b.verificationStatus === 'VERIFIED').length} verified
                        </Badge>
                        <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 px-3 py-1 font-semibold">
                          {batches.filter(b => b.verificationStatus === 'REJECTED').length} rejected
                        </Badge>
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 px-3 py-1 font-semibold">
                          {batches.filter(b => b.verificationStatus === 'PENDING' || b.verificationStatus === null || b.verificationStatus === undefined).length} pending
                        </Badge>
                        {/* Chevron V-shaped button */}
                        <div className="transition-transform duration-200">
                          {expandedFarmers.has(farmer.id) ? (
                            <ChevronDown className="h-6 w-6 text-gray-600" />
                          ) : (
                            <ChevronRight className="h-6 w-6 text-gray-600" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Farmer's Batches - Expandable */}
                  {expandedFarmers.has(farmer.id) && (
                    <div className="border-t bg-white">
                      {batches.length === 0 ? (
                        <div className="p-6 text-center text-slate-500">
                          No batches created by this farmer yet
                        </div>
                      ) : (
                        <div className="space-y-3 p-6">
                          {batches.map((batch) => (
                            <div key={batch.id} className="border-2 border-slate-100 rounded-xl p-4 hover:border-green-200 hover:bg-green-50/30 transition-all duration-200">
                              <div className="flex items-start justify-between">
                                {/* Left: Batch name (crop name) */}
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-3">
                                    <h4 className="font-black text-lg text-slate-800">{batch.name}</h4>
                                    <Badge variant="outline" className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-50 text-blue-700 border-blue-200">
                                      {batch.category}
                                    </Badge>
                                    <Badge 
                                      variant={batch.status === 'VERIFIED' ? "default" : "outline"}
                                      className={
                                        batch.status === 'VERIFIED' 
                                          ? "bg-green-600 text-white font-semibold px-3 py-1" 
                                          : batch.status === 'REJECTED'
                                          ? "bg-red-100 text-red-800 border-red-300 font-semibold px-3 py-1"
                                          : "bg-yellow-100 text-yellow-800 border-yellow-300 font-semibold px-3 py-1"
                                      }
                                    >
                                      {batch.status === 'VERIFIED' ? 'Verified' : batch.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                                    </Badge>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                      <Calendar className="h-4 w-4 text-slate-400" />
                                      <span className="font-medium">{batch.plantingDate?.toLocaleDateString() || 'Not set'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <MapPin className="h-4 w-4 text-slate-400" />
                                      <span className="font-medium">{getLocationDisplay(batch.location || 'Not specified')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Package className="h-4 w-4 text-slate-400" />
                                      <span className="font-medium">
                                        {batch.quantity ? `${batch.quantity} ${batch.unit || ''}` : 
                                         batch.area ? `${batch.area} acres` : 'Area not specified'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                {/* Right: View button (chevron-down) */}
                                <div className="flex items-center gap-3 ml-6">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleViewBatch(batch)}
                                    className="gap-2 border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 font-semibold rounded-xl transition-all duration-200"
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                    View
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Details Popup Modal */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent className="sm:max-w-3xl bg-white rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight">
              Batch Details - {selectedBatch?.name}
            </DialogTitle>
            <DialogDescription>
              Review farmer batch submission, verify images, and approve or reject the batch for blockchain verification.
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-6 py-4">
              {/* Full Batch Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Batch Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Batch Name:</span> 
                        <span className="font-semibold">{selectedBatch.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Category:</span> 
                        <span className="font-semibold">{selectedBatch.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Quantity:</span> 
                        <span className="font-semibold">{selectedBatch.quantity} {selectedBatch.unit}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Location:</span> 
                        <span className="font-semibold">{getLocationDisplay(selectedBatch.location || 'Not specified')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Planting Date:</span> 
                        <span className="font-semibold">{selectedBatch.plantingDate?.toLocaleDateString() || 'Not set'}</span>
                      </div>
                      {selectedBatch.sowingDate && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Sowing Date:</span> 
                          <span className="font-semibold">{selectedBatch.sowingDate.toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Expected Harvest:</span> 
                        <span className="font-semibold">{selectedBatch.expectedHarvestDate?.toLocaleDateString() || 'Not set'}</span>
                      </div>
                      {selectedBatch.actualHarvestDate && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Actual Harvest:</span> 
                          <span className="font-semibold">{selectedBatch.actualHarvestDate.toLocaleDateString()}</span>
                        </div>
                      )}
                      {selectedBatch.batchCode && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Batch Code:</span> 
                          <span className="font-semibold">{selectedBatch.batchCode}</span>
                        </div>
                      )}
                      {selectedBatch.area && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Area:</span> 
                          <span className="font-semibold">{selectedBatch.area} acres</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Status:</span> 
                        <Badge 
                          variant={selectedBatch.status === 'VERIFIED' ? "default" : "outline"}
                          className={
                            selectedBatch.status === 'VERIFIED' 
                              ? "bg-green-600 text-white" 
                              : selectedBatch.status === 'REJECTED'
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {selectedBatch.status === 'VERIFIED' ? 'Verified' : selectedBatch.status === 'REJECTED' ? 'Rejected' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Created:</span> 
                        <span className="font-semibold">{selectedBatch.createdAt.toLocaleDateString()}</span>
                      </div>
                      {selectedBatch.verifiedAt && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">Verified On:</span> 
                          <span className="font-semibold">{selectedBatch.verifiedAt.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-lg">Agricultural Details</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Fertilizers Used:</span>
                        <p className="mt-1 text-gray-800">{selectedBatch.fertilizers || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Pesticides Used:</span>
                        <p className="mt-1 text-gray-800">{selectedBatch.pesticides || 'Not specified'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="mt-1 text-gray-800">{selectedBatch.description || 'No description provided'}</p>
                      </div>
                      
                      {/* QR Code Section - Automatically generated by blockchain */}
                      {selectedBatch.certificate_id && selectedBatch.qrCode && qrCodeImage && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <span className="font-medium text-gray-600 block mb-3">🎉 Blockchain Certificate QR Code:</span>
                          <Card className="border-2 shadow-sm bg-gradient-to-br from-green-50 to-blue-50">
                            <CardContent className="p-4">
                              <div className="flex justify-center mb-3">
                                <div className="bg-white p-4 rounded-lg shadow-md border-2 border-green-200">
                                  <img
                                    src={qrCodeImage}
                                    alt={`QR Code for ${selectedBatch.name}`}
                                    className="w-[200px] h-[200px] object-contain"
                                  />
                                </div>
                              </div>
                              <div className="text-center space-y-2">
                                <p className="text-xs text-green-700 font-bold">✅ Certificate Generated on Blockchain</p>
                                <p className="text-xs text-gray-600 font-semibold">Scan to verify supply chain journey</p>
                                <p className="text-xs text-gray-500 font-mono break-all bg-white p-2 rounded border">
                                  Certificate ID: {selectedBatch.certificate_id}
                                </p>
                                <Button
                                  onClick={() => {
                                const link = document.createElement('a');
                                link.download = `${selectedBatch.certificate_id}_QR.png`;
                                link.href = qrCodeImage;
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                                toast.success('QR code downloaded successfully!');
                              }}
                              className="w-full gap-2 bg-green-600 hover:bg-green-700"
                            >
                              <Download className="h-4 w-4" />
                              Download Certificate QR
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stages Section */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3 text-lg flex items-center gap-2">
                  Farming Stages Progress
                  {isLoadingStages && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                  )}
                </h4>
                {!isLoadingStages ? (
                  <div className="space-y-4">
                    {getOrganizedStages().map((stage, stageIndex) => {
                      const hasImages = stage.imageUrls && stage.imageUrls.length > 0;
                      const isCompleted = stage.status === 'COMPLETED';
                      const isInProgress = stage.status === 'IN_PROGRESS';
                      
                      return (
                        <div 
                          key={`${stage.name}-${stageIndex}`} 
                          className={`border-2 rounded-xl p-4 transition-all duration-200 ${
                            hasImages 
                              ? 'bg-green-50 border-green-200 hover:border-green-300' 
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                isCompleted 
                                  ? 'bg-green-600 text-white' 
                                  : isInProgress
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {stageIndex + 1}
                              </div>
                              <h5 className="font-bold text-gray-800 text-lg">{stage.name}</h5>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge 
                                variant="outline"
                                className={
                                  isCompleted 
                                    ? "bg-green-100 text-green-800 border-green-300 font-semibold" 
                                    : isInProgress
                                    ? "bg-blue-100 text-blue-800 border-blue-300 font-semibold"
                                    : "bg-gray-100 text-gray-600 border-gray-300 font-semibold"
                                }
                              >
                                {stage.status}
                              </Badge>
                              {hasImages && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 font-semibold">
                                  {stage.imageUrls.length} image{stage.imageUrls.length !== 1 ? 's' : ''}
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {stage.notes && (
                            <div className="mb-3 p-3 bg-white rounded-lg border">
                              <p className="text-sm text-gray-700 font-medium">Notes:</p>
                              <p className="text-sm text-gray-600 mt-1">{stage.notes}</p>
                            </div>
                          )}
                          
                          {hasImages ? (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-gray-700">
                                  Stage Images - Admin Verification Required
                                </p>
                                <div className="flex gap-2">
                                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                                    ✓ {stage.imageUrls.filter((imageUrl) => imageVerificationMap.get(imageUrl) === 'REAL').length} Verified
                                  </Badge>
                                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 text-xs">
                                    ✗ {stage.imageUrls.filter((imageUrl) => imageVerificationMap.get(imageUrl) === 'FAKE').length} Flagged
                                  </Badge>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {stage.imageUrls.map((imageUrl, imageIndex) => {
                                  const aiValidation = aiValidationMap.get(imageUrl);
                                  
                                  return (
                                    <div key={imageIndex} className="relative flex flex-col">
                                      <StageImage
                                        src={imageUrl}
                                        alt={`${stage.name} - Image ${imageIndex + 1}`}
                                        className="w-full h-24 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200"
                                        showVerificationControls={true}
                                        imageIndex={imageIndex}
                                        stageId={stage.id || stage.name}
                                        batchId={selectedBatch?.id}
                                        farmerId={selectedBatch?.farmerId}
                                        initialVerificationStatus={imageVerificationMap.get(imageUrl) || null}
                                        aiValidation={aiValidation}
                                        onVerificationUpdate={() => {
                                          // Refresh verification data after verification update
                                          if (selectedBatch?.id) {
                                            fetchBatchVerifications(selectedBatch.id);
                                            fetchVerifications();
                                          }
                                        }}
                                      />
                                      {/* Display AI validation insights below the image */}
                                      {aiValidation && <AIValidationBadge aiValidation={aiValidation} />}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-4 bg-white rounded-lg border-2 border-dashed border-gray-300">
                              <p className="text-gray-500 text-sm">No images submitted for this stage yet</p>
                              {!isCompleted && (
                                <p className="text-gray-400 text-xs mt-1">Farmer needs to upload images to complete this stage</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="ml-2 text-gray-600">Loading farming stages...</span>
                  </div>
                )}
              </div>

              {/* Verification Summary */}
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border">
                <h4 className="font-semibold mb-3 text-lg text-gray-800">Admin Verification Summary</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-green-600 rounded-full"></div>
                      <span className="font-semibold text-gray-700">Authentic Images</span>
                    </div>
                    <p className="text-2xl font-black text-green-700">
                      {Array.from(imageVerificationMap.values()).filter(status => status === 'REAL').length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-red-600 rounded-full"></div>
                      <span className="font-semibold text-gray-700">Flagged as Fake</span>
                    </div>
                    <p className="text-2xl font-black text-red-700">
                      {Array.from(imageVerificationMap.values()).filter(status => status === 'FAKE').length}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
                      <span className="font-semibold text-gray-700">Pending Review</span>
                    </div>
                    <p className="text-2xl font-black text-yellow-700">
                      {(() => {
                        // Get all actual image URLs from stages (only Supabase images - farmer uploaded)
                        const allImageUrls: string[] = [];
                        getOrganizedStages().forEach(stage => {
                          if (stage.imageUrls) {
                            // Filter to only include Supabase storage images (real farmer uploads)
                            const farmerImages = stage.imageUrls.filter(url => 
                              url.includes('supabase') || url.includes('storage')
                            );
                            allImageUrls.push(...farmerImages);
                          }
                        });
                        
                        // Add batch-level images if any (also filter for Supabase images)
                        if (selectedBatch.imageUrls) {
                          const farmerBatchImages = selectedBatch.imageUrls.filter(url => 
                            url.includes('supabase') || url.includes('storage')
                          );
                          allImageUrls.push(...farmerBatchImages);
                        }
                        
                        // Count only farmer images that don't have verification status
                        const pendingCount = allImageUrls.filter(imageUrl => 
                          !imageVerificationMap.has(imageUrl)
                        ).length;
                        
                        return pendingCount;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Verify and Reject Buttons at the end */}
              <div className="border-t pt-6 mt-6">
                <h4 className="font-semibold mb-4 text-lg">Admin Actions</h4>
                <div className="flex gap-4">
                  {selectedBatch.status === 'PENDING' ? (
                    <>
                      <Button
                        onClick={() => handleVerifyBatch(selectedBatch.id, true)}
                        disabled={isLoading}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Verify Batch
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleVerifyBatch(selectedBatch.id, false)}
                        disabled={isLoading}
                        className="flex-1 gap-2 text-red-600 hover:text-red-700 border-2 border-red-200 hover:border-red-500 hover:bg-red-50 font-semibold py-3 rounded-xl transition-all duration-200"
                      >
                        <XCircle className="h-5 w-5" />
                        Reject Batch
                      </Button>
                    </>
                  ) : selectedBatch.status === 'VERIFIED' ? (
                    <Button
                      variant="outline"
                      onClick={() => handleVerifyBatch(selectedBatch.id, false)}
                      disabled={isLoading}
                      className="w-full gap-2 text-red-600 hover:text-red-700 border-2 border-red-200 hover:border-red-500 hover:bg-red-50 font-semibold py-3 rounded-xl transition-all duration-200"
                    >
                      <XCircle className="h-5 w-5" />
                      Revoke Verification
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleVerifyBatch(selectedBatch.id, true)}
                      disabled={isLoading}
                      className="w-full bg-green-600 hover:bg-green-700 text-white gap-2 font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Verify Batch
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FarmerDashboardAdmin;
