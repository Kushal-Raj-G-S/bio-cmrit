'use client';

/**
 * Complete Blockchain Batch Uploader
 * 
 * This component demonstrates the FULL flow:
 * 1. Upload image to storage (Supabase) → Get URL
 * 2. Record to blockchain with imageUrl
 * 3. Track batch across multiple stages
 */

import { useState } from 'react';
import { useBlockchainRecord } from '@/hooks/useBlockchainRecord';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Stage {
  stageName: string;
  imageUrl: string;
  timestamp: string;
  transactionId: string;
  blockNumber: number;
}

const VALID_STAGES = [
  'Land Preparation',
  'Sowing',
  'Growing',
  'Fertilizer Application',
  'Pest Control',
  'Irrigation',
  'Harvesting',
  'Storage',
  'Transport'
];

export function BlockchainBatchUploader() {
  // Batch tracking
  const [currentBatchId, setCurrentBatchId] = useState<string | null>(
    typeof window !== 'undefined' ? localStorage.getItem('currentBatchId') : null
  );
  const [stages, setStages] = useState<Stage[]>([]);
  
  // Form state
  const [farmerName, setFarmerName] = useState('');
  const [location, setLocation] = useState('');
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedStage, setSelectedStage] = useState('Sowing');
  
  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const { recordFirstImage, recordSubsequentImage, recording } = useBlockchainRecord();

  /**
   * STEP 1: Upload image to storage and get URL
   */
  const uploadImageToStorage = async (file: File): Promise<string> => {
    setUploadProgress('Uploading image to storage...');
    
    const formData = new FormData();
    formData.append('file', file);
    
    // Upload to Next.js API endpoint which stores in Supabase
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload image to storage');
    }

    const result = await response.json();
    
    if (!result.url) {
      throw new Error('No URL returned from storage');
    }

    console.log('✅ Image uploaded to storage:', result.url);
    return result.url;
  };

  /**
   * STEP 2A: Handle FIRST image upload (creates batch)
   */
  const handleFirstImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate form
    if (!farmerName || !location || !cropType || !quantity) {
      setError('Please fill in all fields');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress('Starting upload...');

    try {
      // Step 1: Upload image to storage → get URL
      const imageUrl = await uploadImageToStorage(file);

      // Step 2: Generate new batch ID
      const batchId = crypto.randomUUID();
      console.log('🆔 Generated batch ID:', batchId);
      setUploadProgress(`Recording batch ${batchId} on blockchain...`);

      // Step 3: Record to blockchain with imageUrl
      const result = await recordFirstImage(
        batchId,
        imageUrl,           // ← URL from storage
        farmerName,
        location,
        cropType,
        parseInt(quantity),
        'kg',
        'Land Preparation'
      );

      if (!result.success) {
        throw new Error(result.error || 'Blockchain recording failed');
      }

      console.log('✅ Batch created on blockchain:', result);

      // Step 4: Save batch ID for future uploads
      setCurrentBatchId(batchId);
      localStorage.setItem('currentBatchId', batchId);

      // Step 5: Add to stages list
      setStages([{
        stageName: 'Land Preparation',
        imageUrl: imageUrl,
        timestamp: result.timestamp || new Date().toISOString(),
        transactionId: result.transactionId || 'N/A',
        blockNumber: result.blockNumber || 1
      }]);

      setUploadProgress('✅ Batch created successfully!');
      
      // Clear form
      event.target.value = '';

    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  /**
   * STEP 2B: Handle SUBSEQUENT image uploads (adds stage)
   */
  const handleSubsequentImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!currentBatchId) {
      setError('No active batch. Please create a batch first.');
      return;
    }

    if (!farmerName || !location) {
      setError('Please fill in farmer name and location');
      return;
    }

    setUploading(true);
    setError(null);
    setUploadProgress('Starting upload...');

    try {
      // Step 1: Upload image to storage → get URL
      const imageUrl = await uploadImageToStorage(file);

      // Step 2: Record stage to blockchain with imageUrl
      setUploadProgress(`Adding ${selectedStage} to blockchain...`);
      const result = await recordSubsequentImage(
        currentBatchId,
        imageUrl,        // ← URL from storage
        selectedStage,
        farmerName,
        location
      );

      if (!result.success) {
        throw new Error(result.error || 'Blockchain recording failed');
      }

      console.log('✅ Stage added to blockchain:', result);

      // Step 3: Add to stages list
      setStages(prev => [...prev, {
        stageName: selectedStage,
        imageUrl: imageUrl,
        timestamp: result.timestamp || new Date().toISOString(),
        transactionId: result.transactionId || 'N/A',
        blockNumber: result.blockNumber || prev.length + 1
      }]);

      setUploadProgress(`✅ Stage "${selectedStage}" added successfully!`);
      
      // Clear form
      event.target.value = '';

    } catch (err) {
      console.error('❌ Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress('');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Start new batch
   */
  const startNewBatch = () => {
    setCurrentBatchId(null);
    localStorage.removeItem('currentBatchId');
    setStages([]);
    setError(null);
    setUploadProgress('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Blockchain Batch Uploader</h1>

      {/* Batch Status */}
      {currentBatchId ? (
        <Card className="p-4 bg-green-50 border-green-200">
          <h3 className="font-semibold text-green-800">✅ Active Batch</h3>
          <p className="text-sm text-green-700 break-all">
            Batch ID: <code className="bg-green-100 px-2 py-1 rounded">{currentBatchId}</code>
          </p>
          <p className="text-sm text-green-700">Stages Completed: {stages.length}</p>
          <Button 
            onClick={startNewBatch} 
            variant="outline" 
            size="sm" 
            className="mt-2"
          >
            Start New Batch
          </Button>
        </Card>
      ) : (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <p className="text-blue-800">📸 Upload your first image to create a new batch</p>
        </Card>
      )}

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <Alert>
          <AlertDescription>{uploadProgress}</AlertDescription>
        </Alert>
      )}

      {/* FIRST IMAGE FORM (Create Batch) */}
      {!currentBatchId && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Create New Batch</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Farmer Name *</label>
              <Input
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="Enter farmer name"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Karnataka, India"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Crop Type *</label>
              <Input
                value={cropType}
                onChange={(e) => setCropType(e.target.value)}
                placeholder="e.g., Wheat, Rice, Corn"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Quantity (kg) *</label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g., 500"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Upload First Image (Land Preparation) *
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleFirstImageUpload}
                disabled={uploading || recording}
              />
            </div>

            {(uploading || recording) && (
              <p className="text-sm text-gray-600">⏳ Processing...</p>
            )}
          </div>
        </Card>
      )}

      {/* SUBSEQUENT IMAGES FORM (Add Stages) */}
      {currentBatchId && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Add Stage to Batch</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Farmer Name *</label>
              <Input
                value={farmerName}
                onChange={(e) => setFarmerName(e.target.value)}
                placeholder="Enter farmer name"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Current Location *</label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g., Karnataka, India"
                disabled={uploading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select Stage *</label>
              <select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                disabled={uploading}
                className="w-full px-3 py-2 border rounded-md"
              >
                {VALID_STAGES.filter(s => s !== 'Land Preparation').map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Stage Image *
              </label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleSubsequentImageUpload}
                disabled={uploading || recording}
              />
            </div>

            {(uploading || recording) && (
              <p className="text-sm text-gray-600">⏳ Processing...</p>
            )}
          </div>
        </Card>
      )}

      {/* Timeline - Show uploaded stages */}
      {stages.length > 0 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Batch Timeline</h2>
          
          <div className="space-y-4">
            {stages.map((stage, index) => (
              <div key={index} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-4">
                  <img 
                    src={stage.imageUrl} 
                    alt={stage.stageName}
                    className="w-32 h-32 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{stage.stageName}</h3>
                    <p className="text-sm text-gray-600">
                      Block #{stage.blockNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Time: {new Date(stage.timestamp).toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 break-all mt-2">
                      TX: {stage.transactionId}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
