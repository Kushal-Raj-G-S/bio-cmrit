'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FarmerImageViewer } from './farmer-image-viewer';
import { 
  Plus, 
  Wheat, 
  TrendingUp, 
  CheckCircle,
  Calendar,
  MapPin,
  Package,
  Upload,
  Camera,
  Trash2,
  Download,
  Award
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useTranslate } from '@/hooks/useTranslate';
import { toast } from 'sonner';

interface CreateBatchFormData {
  name: string;
  category: string;
  area: string;
  location: string; // Add location field
  description: string;
  imageUrls: string[];
}

interface Stage {
  id?: string;
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes?: string;
  imageUrls: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

interface StageFormData {
  name: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  notes: string;
  images: File[];  // Files for upload
}

interface Batch {
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
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'ACTIVE';
  verified?: boolean;
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt?: Date;
  verifiedBy?: string;
  qrCode?: string;
  createdAt: Date;
  updatedAt: Date;
  farmerId: string;
}

export function FarmerDashboard(): React.JSX.Element {
  const { user } = useAuth();
  const { t } = useTranslate();
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [isStageDialogOpen, setIsStageDialogOpen] = useState<boolean>(false);
  const [stages, setStages] = useState<Stage[]>([]);
  const [isStageLoading, setIsStageLoading] = useState<boolean>(false);
  
  const [formData, setFormData] = useState<CreateBatchFormData>({
    name: '',
    category: '',
    area: '',
    location: '',
    description: '',
    imageUrls: []
  });

  // Auto-fill location from user profile when dialog opens
  useEffect(() => {
    if (isCreateDialogOpen && user?.location) {
      // User location should auto-populate when creating batch
      console.log('Auto-filling location from profile:', user.location);
      const locationStr = typeof user.location === 'string' 
        ? user.location 
        : (user.location as any)?.address || '';
      setFormData(prev => ({
        ...prev,
        location: locationStr
      }));
    }
  }, [isCreateDialogOpen, user]);

  // Farming stages definition
  const farmingStages = [
    'Land Preparation',
    'Sowing',
    'Germination',
    'Vegetative Growth',
    'Flowering & Pollination',
    'Harvesting',
    'Post-Harvest Processing'
  ];

  // Initialize stages form data
  const initializeStages = (): StageFormData[] => {
    return farmingStages.map(stage => ({
      name: stage,
      status: 'PENDING' as const,
      notes: '',
      images: []
    }));
  };

  const [stageFormData, setStageFormData] = useState<StageFormData[]>(initializeStages());

  // Fetch stages for a batch
  const fetchStages = async (batchId: string) => {
    try {
      setIsStageLoading(true);
      const response = await fetch(`/api/stages?batchId=${batchId}`);
      if (response.ok) {
        const data = await response.json();
        setStages(data);
        
        // Update form data with existing stages
        const updatedFormData = initializeStages();
        data.forEach((stage: Stage) => {
          const index = updatedFormData.findIndex(s => s.name === stage.name);
          if (index !== -1) {
            updatedFormData[index] = {
              name: stage.name,
              status: stage.status,
              notes: stage.notes || '',
              images: [] // We'll handle existing images separately
            };
          }
        });
        setStageFormData(updatedFormData);
      }
    } catch (error) {
      console.error('Error fetching stages:', error);
      toast.error('Failed to load stages');
    } finally {
      setIsStageLoading(false);
    }
  };

  // Handle stage form update
  const handleStageUpdate = (index: number, field: keyof StageFormData, value: string | File[]) => {
    const updatedStages = [...stageFormData];
    updatedStages[index] = { ...updatedStages[index], [field]: value };
    setStageFormData(updatedStages);
  };

  // Handle image upload for stage
  const handleImageUpload = (index: number, files: FileList | null) => {
    if (!files) return;
    
    const imageFiles = Array.from(files);
    const updatedStages = [...stageFormData];
    updatedStages[index] = { ...updatedStages[index], images: imageFiles };
    setStageFormData(updatedStages);
  };

  // Upload files to Supabase Storage and return URLs
  const uploadFilesToSupabase = async (files: File[], stageName: string, stageId?: string): Promise<string[]> => {
    const uploadPromises = files.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add folder structure parameters for organized storage
      formData.append('farmerName', user?.name || 'unknown-farmer');
      formData.append('batchName', selectedBatch?.name || selectedBatch?.batchCode || 'unknown-batch');
      formData.append('stageName', stageName);
      
      // Add AI validation parameters - ALWAYS include batchId and farmerId
      if (selectedBatch?.id) {
        formData.append('batchId', selectedBatch.id);
      }
      // Use stageName as stageId if real stageId doesn't exist yet
      formData.append('stageId', stageId || stageName);
      
      if (user?.id) {
        formData.append('farmerId', user.id);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();
      
      // Log AI validation result if present (no toast - just console log)
      if (data.aiValidation) {
        console.log('🤖 AI Validation Result:', data.aiValidation);
      }
      
      return data.url; // Return the Supabase public URL
    });

    return Promise.all(uploadPromises);
  };

  // Submit individual stage
  const handleSubmitStage = async (stageIndex: number) => {
    if (!selectedBatch || !user?.id) return;

    const stage = stageFormData[stageIndex];
    
    // Validate minimum image requirement for this stage only
    if (stage.images.length < 2) {
      toast.error(`Stage "${stage.name}" requires at least 2 images`);
      return;
    }

    try {
      setIsStageLoading(true);

      // Upload images to Supabase Storage with AI validation
      // We'll use batch info without needing stageId (AI can validate without stage existing)
      toast.info(`Uploading ${stage.images.length} images for "${stage.name}" with AI validation...`);
      const uploadedImageUrls = await uploadFilesToSupabase(
        stage.images, 
        stage.name, 
        undefined // No stageId yet - AI will validate and store in raw_uploads/ai_validations
      );

      // Now create/update the stage with uploaded image URLs
      const stageWithImages = {
        ...stage,
        images: uploadedImageUrls
      };

      const response = await fetch('/api/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: selectedBatch.id,
          farmerId: user.id,
          stages: [stageWithImages]
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to create stage "${stage.name}"`);
      }

      toast.success(`Stage "${stage.name}" submitted successfully with AI validation!`);
      // Refresh stages to show updated status
      await fetchStages(selectedBatch.id);
      // Clear the images for this stage after successful submission
      const updatedStages = [...stageFormData];
      updatedStages[stageIndex] = { ...updatedStages[stageIndex], images: [] };
      setStageFormData(updatedStages);

    } catch (error) {
      console.error('Error submitting stage:', error);
      if (error instanceof Error) {
        toast.error(`Failed to upload images: ${error.message}`);
      } else {
        toast.error(`Failed to submit stage`);
      }
    } finally {
      setIsStageLoading(false);
    }
  };

  // Check if a stage has been submitted (exists in database)
  const isStageSubmitted = (stageName: string): boolean => {
    const existingStage = stages.find(s => s.name === stageName);
    return !!existingStage;
  };

  // Submit stages (keeping the old function for bulk submission - optional)
  const handleSubmitAllStages = async () => {
    if (!selectedBatch || !user?.id) return;

    try {
      setIsStageLoading(true);

      // Get stages that have at least 2 images and are not already submitted
      const stagesToSubmit = stageFormData.filter(stage => 
        stage.images.length >= 2 && !isStageSubmitted(stage.name)
      );

      if (stagesToSubmit.length === 0) {
        toast.info('No stages ready for submission. Please upload at least 2 images for each stage you want to submit.');
        return;
      }

      toast.info(`Uploading images for ${stagesToSubmit.length} stages...`);

      // Upload images to Supabase Storage for all stages
      const stagesWithImages = await Promise.all(
        stagesToSubmit.map(async (stage) => ({
          ...stage,
          images: await uploadFilesToSupabase(stage.images, stage.name) // Use Supabase URLs
        }))
      );

      const response = await fetch('/api/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          batchId: selectedBatch.id,
          farmerId: user.id,
          stages: stagesWithImages
        }),
      });

      if (response.ok) {
        toast.success(`${stagesToSubmit.length} stage(s) submitted successfully!`);
        // Refresh stages
        await fetchStages(selectedBatch.id);
        // Clear only the submitted stages' images
        const updatedFormData = [...stageFormData];
        stagesToSubmit.forEach(submittedStage => {
          const index = updatedFormData.findIndex(s => s.name === submittedStage.name);
          if (index !== -1) {
            updatedFormData[index].images = [];
          }
        });
        setStageFormData(updatedFormData);
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to submit stages');
      }
    } catch (error) {
      console.error('Error submitting stages:', error);
      if (error instanceof Error) {
        toast.error(`Failed to upload images: ${error.message}`);
      } else {
        toast.error('Failed to submit stages');
      }
    } finally {
      setIsStageLoading(false);
    }
  };

  // Handle opening stage submission modal
  const handleOpenStageModal = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsStageDialogOpen(true);
    fetchStages(batch.id);
  };

  // Fetch farmer's batches
  useEffect(() => {
    const fetchBatches = async () => {
      if (!user?.id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/batches?farmerId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          setBatches(data);
        }
      } catch (error) {
        console.error('Error fetching batches:', error);
        toast.error('Failed to load batches');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBatches();
  }, [user?.id]);

  const cropCategories = [
    'Grains', 'Vegetables', 'Fruits', 'Pulses', 'Oilseeds', 'Spices', 'Other'
  ];

  const handleCreateBatch = async (): Promise<void> => {
    if (!formData.name || !formData.category || !formData.area || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch('/api/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          category: formData.category,
          area: formData.area,
          location: formData.location, // Send location to API
          description: formData.description,
          farmerId: user.id,
        }),
      });

      if (response.ok) {
        const newBatch = await response.json();
        setBatches(prev => [newBatch, ...prev]);
        toast.success('Batch created successfully!');
        setIsCreateDialogOpen(false);
        setFormData({
          name: '',
          category: '',
          area: '',
          location: '',
          description: '',
          imageUrls: []
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Failed to create batch');
      }
    } catch (error) {
      console.error('Error creating batch:', error);
      toast.error('Failed to create batch');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-500';
      case 'harvested': return 'bg-blue-500';
      case 'sold': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const verifiedCount = batches.filter(batch => batch.verificationStatus === 'VERIFIED').length;
  const pendingCount = batches.filter(batch => batch.verificationStatus === 'PENDING').length;
  const rejectedCount = batches.filter(batch => batch.verificationStatus === 'REJECTED').length;

  // Helper function to open view modal
  const handleViewBatch = (batch: Batch) => {
    setSelectedBatch(batch);
    setIsViewDialogOpen(true);
  };

  // Helper function to get location display
  const getLocationDisplay = (location: string | { lat: number; lng: number; address: string } | undefined): string => {
    if (!location) return 'Not specified';
    if (typeof location === 'string') return location;
    if (typeof location === 'object' && 'address' in location) {
      return location.address || `${location.lat}, ${location.lng}`;
    }
    return 'Not specified';
  };

  // Handle certificate download
  const handleDownloadCertificate = async (batch: Batch) => {
    try {
      // Check if batch is FB003 (only batch with all 7 stages completed)
      if (batch.batchCode !== 'FB003') {
        toast.error('Certificate is only available for batches with all 7 farming stages completed');
        return;
      }

      // Check if batch is verified and has QR code
      if (batch.verificationStatus !== 'VERIFIED' || !batch.qrCode) {
        toast.error('Certificate requires verification and QR code');
        return;
      }

      toast.info('Downloading certificate...');

      // Download the pre-generated certificate PDF
      const link = document.createElement('a');
      link.href = '/KrishiBarosa_Certificate_FB003.pdf';
      link.download = 'KrishiBarosa_Certificate_FB003.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Certificate downloaded successfully! Check your downloads folder.');
    } catch (error) {
      console.error('Error downloading certificate:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to download certificate. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Wheat className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight mb-1">
              {t('dashboard.title')}
            </h1>
            <p className="text-sm text-slate-600 font-medium">{t('dashboard.subtitle')}</p>
          </div>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
              <Plus className="h-5 w-5" />
              {t('dashboard.createBatch')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>{t('batchForm.title')}</DialogTitle>
              <DialogDescription>
                {t('batchForm.description')}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-name">{t('batchForm.cropName')} *</Label>
                  <Input
                    id="batch-name"
                    placeholder={t('batchForm.cropNamePlaceholder')}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-category">{t('batchForm.category')} *</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder={t('batchForm.selectCategory')} />
                    </SelectTrigger>
                    <SelectContent>
                      {cropCategories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="batch-location">{t('batchForm.location')} *</Label>
                  <Input
                    id="batch-location"
                    type="text"
                    placeholder={t('batchForm.enterLocation')}
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="batch-area">{t('batchForm.area')} *</Label>
                  <Input
                    id="batch-area"
                    type="number"
                    placeholder={t('batchForm.areaPlaceholder')}
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="batch-description">{t('batchForm.descriptionLabel')}</Label>
                <Textarea
                  id="batch-description"
                  placeholder={t('batchForm.descriptionPlaceholder')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleCreateBatch}
                  disabled={isLoading}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 font-semibold"
                >
                  {isLoading ? t('batchForm.creating') : t('batchForm.submit')}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="px-8 h-12 font-semibold"
                >
                  {t('batchForm.cancel')}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.totalBatches')}</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.pendingBatches')}</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.verifiedBatches')}</p>
                <p className="text-2xl font-bold">{verifiedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-3 rounded-full">
                <Package className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">{t('dashboard.rejectedBatches')}</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* My Batches */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wheat className="h-5 w-5" />
            {t('dashboard.myBatches')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">{t('dashboard.loading')}</p>
          ) : batches.length === 0 ? (
            <p className="text-center text-gray-500 py-8">{t('dashboard.noBatchesMessage')}</p>
          ) : (
            <div className="space-y-4">
              {batches.map((batch, index) => (
                <div key={batch.id || index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-lg">{batch.name}</h3>
                        <Badge variant="outline" className="text-xs">
                          {batch.category}
                        </Badge>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(batch.status)}`} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {batch.sowingDate ? new Date(batch.sowingDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {batch.area || 0} acres
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" />
                          <Badge
                            variant={batch.verificationStatus === 'VERIFIED' ? "default" : "outline"}
                            className={
                              batch.verificationStatus === 'VERIFIED'
                                ? "bg-green-600 text-white text-xs px-2 py-1"
                                : batch.verificationStatus === 'REJECTED'
                                ? "bg-red-100 text-red-800 border-red-300 text-xs px-2 py-1"
                                : "bg-yellow-100 text-yellow-800 border-yellow-300 text-xs px-2 py-1"
                            }
                          >
                            {batch.verificationStatus === 'VERIFIED' ? 'Verified' : 
                             batch.verificationStatus === 'REJECTED' ? 'Rejected' : 'Pending'}
                          </Badge>
                        </div>
                      </div>
                      {batch.description && (
                        <p className="text-sm text-gray-700 mb-3">{batch.description}</p>
                      )}
                    </div>
                    <div className="ml-4 flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewBatch(batch)}
                        className="gap-2 border-2 border-slate-200 hover:border-green-500 hover:bg-green-50 font-semibold rounded-xl transition-all duration-200"
                      >
                        <Package className="h-4 w-4" />
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenStageModal(batch)}
                        className="gap-2 border-2 border-slate-200 hover:border-blue-500 hover:bg-blue-50 font-semibold rounded-xl transition-all duration-200"
                      >
                        <Camera className="h-4 w-4" />
                        Stages
                      </Button>
                      {batch.batchCode === 'FB003' && batch.verificationStatus === 'VERIFIED' && batch.qrCode && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadCertificate(batch)}
                          className="gap-2 border-2 border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 hover:from-amber-100 hover:to-yellow-100 text-amber-700 hover:border-amber-400 font-semibold rounded-xl transition-all duration-200 shadow-sm"
                        >
                          <Award className="h-4 w-4" />
                          Certificate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Batch Details View Modal */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl bg-white rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight">
              Batch Details - {selectedBatch?.name}
            </DialogTitle>
            <DialogDescription>
              View detailed information about this batch including farming stages and verification status.
            </DialogDescription>
          </DialogHeader>
          {selectedBatch && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-base">Batch Information</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Batch Code:</span> 
                        <span className="font-semibold">{selectedBatch.batchCode || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Batch Name:</span> 
                        <span className="font-semibold">{selectedBatch.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Category:</span> 
                        <span className="font-semibold">{selectedBatch.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Area:</span> 
                        <span className="font-semibold">{selectedBatch.area} acres</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Location:</span> 
                        <span className="font-semibold">{getLocationDisplay(selectedBatch.location)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Sowing Date:</span> 
                        <span className="font-semibold">{selectedBatch.sowingDate ? new Date(selectedBatch.sowingDate).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Status:</span> 
                        <Badge 
                          variant={selectedBatch.verificationStatus === 'VERIFIED' ? "default" : "outline"}
                          className={
                            selectedBatch.verificationStatus === 'VERIFIED' 
                              ? "bg-green-600 text-white" 
                              : selectedBatch.verificationStatus === 'REJECTED'
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {selectedBatch.verificationStatus === 'VERIFIED' ? 'Verified' : 
                           selectedBatch.verificationStatus === 'REJECTED' ? 'Rejected' : 'Pending'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">Created:</span> 
                        <span className="font-semibold">{selectedBatch.createdAt ? new Date(selectedBatch.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      {selectedBatch.verifiedAt && (
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-600">
                            {selectedBatch.verificationStatus === 'VERIFIED' ? 'Verified On:' : 'Rejected On:'}
                          </span> 
                          <span className="font-semibold">{new Date(selectedBatch.verifiedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-3 text-base">Additional Details</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Description:</span>
                        <p className="mt-1 text-gray-800">{selectedBatch.description || 'No description provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Certificate Download Section for Verified Batches */}
              {selectedBatch.batchCode === 'FB003' && selectedBatch.verificationStatus === 'VERIFIED' && selectedBatch.qrCode && (
                <div className="border-t border-slate-200 pt-6 mt-6">
                  <div className="bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-100 rounded-full">
                          <Award className="h-8 w-8 text-amber-600" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg text-amber-900 mb-1">🎉 Verification Certificate Available</h4>
                          <p className="text-sm text-amber-700 mb-1">
                            Congratulations! You've completed all 7 farming stages and your batch has been verified on the blockchain.
                          </p>
                          <p className="text-xs text-amber-600 font-semibold">
                            ✓ All stages documented | ✓ Blockchain verified | ✓ QR code generated
                          </p>
                        </div>
                      </div>
                      <Button
                        onClick={() => handleDownloadCertificate(selectedBatch)}
                        className="gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      >
                        <Download className="h-5 w-5" />
                        Download Certificate
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Stages Submission Modal */}
      <Dialog open={isStageDialogOpen} onOpenChange={setIsStageDialogOpen}>
        <DialogContent className="sm:max-w-4xl bg-white rounded-2xl border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-lg font-bold bg-gradient-to-r from-green-600 via-emerald-600 to-green-700 bg-clip-text text-transparent tracking-tight">
              {t('stages.dialogTitle')} - {selectedBatch?.name}
            </DialogTitle>
            <DialogDescription>
              {t('stages.dialogDescription')}
            </DialogDescription>
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                <span>{t('stages.progress')}: {stages.length} {t('stages.stagesSubmitted')} {farmingStages.length}</span>
                <span>{Math.round((stages.length / farmingStages.length) * 100)}% {t('stages.complete')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(stages.length / farmingStages.length) * 100}%` }}
                />
              </div>
            </div>
          </DialogHeader>
          <div className="space-y-6 py-4">
            {isStageLoading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <span className="ml-2 text-gray-500">{t('stages.loadingStages')}</span>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">{t('stages.howItWorks')}</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• {t('stages.instruction1')}</li>
                    <li>• {t('stages.instruction2')}</li>
                    <li>• {t('stages.instruction3')}</li>
                    <li>• {t('stages.instruction4')}</li>
                    <li>• {t('stages.instruction5')}</li>
                  </ul>
                </div>
                
                {stageFormData.map((stage, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          isStageSubmitted(stage.name) 
                            ? 'bg-green-600 text-white' 
                            : 'bg-gray-400 text-white'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg text-gray-800">{stage.name}</h3>
                          <div className="flex items-center gap-2">
                            {isStageSubmitted(stage.name) && (
                              <Badge className="bg-green-100 text-green-800 border-green-300">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                {t('stages.submitted')}
                              </Badge>
                            )}
                            {stage.images.length >= 2 && !isStageSubmitted(stage.name) && (
                              <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                                {t('stages.readyToSubmit')}
                              </Badge>
                            )}
                            {stage.images.length < 2 && !isStageSubmitted(stage.name) && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">
                                {t('stages.needMoreImages')} {2 - stage.images.length} {t('stages.moreImages')}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleSubmitStage(index)}
                          disabled={isStageLoading || stage.images.length < 2}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold"
                        >
                          {isStageLoading ? t('stages.saving') : isStageSubmitted(stage.name) ? t('stages.update') : t('stages.saveStage')}
                        </Button>
                      </div>
                    </div>
                    
                    {/* Show Already Uploaded Images from Database */}
                    {stages.find(s => s.name === stage.name)?.imageUrls && stages.find(s => s.name === stage.name)!.imageUrls!.length > 0 && (
                      <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          Already Uploaded Images ({stages.find(s => s.name === stage.name)!.imageUrls!.length})
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {stages.find(s => s.name === stage.name)!.imageUrls!.map((imageUrl, imgIndex) => (
                            <FarmerImageViewer
                              key={imgIndex}
                              imageUrl={imageUrl}
                              alt={`${stage.name} - Image ${imgIndex + 1}`}
                              className="w-full h-32 object-cover rounded-lg border-2"
                              stageId={stages.find(s => s.name === stage.name)?.id}
                              batchId={selectedBatch?.id}
                              showVerificationStatus={true}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-blue-700 mt-2">
                          ✓ Verified = Admin approved  |  ❌ Flagged = Rejected, click for details
                        </p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`stage-status-${index}`}>{t('stages.status')}</Label>
                        <Select
                          value={stage.status}
                          onValueChange={(value) => handleStageUpdate(index, 'status', value)}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={t('stages.selectStatus')} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="PENDING">{t('stages.pending')}</SelectItem>
                            <SelectItem value="IN_PROGRESS">{t('stages.inProgress')}</SelectItem>
                            <SelectItem value="COMPLETED">{t('stages.completed')}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`stage-images-${index}`}>{t('stages.imagesLabel')} *</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`stage-images-${index}`}
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => handleImageUpload(index, e.target.files)}
                            className="flex-1"
                          />
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <Upload className="h-4 w-4" />
                            {stage.images.length}/2+
                          </div>
                        </div>
                        {stage.images.length > 0 && (
                          <div className="flex gap-2 flex-wrap mt-2">
                            {stage.images.map((image, imgIndex) => (
                              <div key={imgIndex} className="relative">
                                <Image
                                  src={URL.createObjectURL(image)}
                                  alt={`Stage ${stage.name} - ${imgIndex + 1}`}
                                  width={64}
                                  height={64}
                                  className="w-16 h-16 object-cover rounded border"
                                />
                                <button
                                  onClick={() => {
                                    const newImages = [...stage.images];
                                    newImages.splice(imgIndex, 1);
                                    handleStageUpdate(index, 'images', newImages);
                                  }}
                                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        {stage.images.length < 2 && (
                          <p className="text-sm text-red-600">{t('stages.atLeast2Required')}</p>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label htmlFor={`stage-notes-${index}`}>{t('stages.notes')}</Label>
                      <Textarea
                        id={`stage-notes-${index}`}
                        placeholder={t('stages.notesPlaceholder')}
                        value={stage.notes}
                        onChange={(e) => handleStageUpdate(index, 'notes', e.target.value)}
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex gap-3 pt-4">
                  {/* Only show Submit All button if there are stages ready to submit */}
                  {stageFormData.some(stage => stage.images.length >= 2 && !isStageSubmitted(stage.name)) && (
                    <Button
                      onClick={handleSubmitAllStages}
                      disabled={isStageLoading}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white h-12 font-semibold"
                    >
                      {isStageLoading ? t('stages.submitting') : t('stages.submitAllReadyStages')}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setIsStageDialogOpen(false)}
                    className="px-8 h-12 font-semibold"
                  >
                    {t('stages.close')}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}