import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useImageUpload } from '@/hooks/useImageUpload';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
  acceptedTypes?: string[];
  className?: string;
}

export function ImageUpload({ 
  onUpload, 
  multiple = false, 
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  className = ''
}: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { uploadImage, uploadMultipleImages, uploadProgress, resetProgress } = useImageUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate file types
    const invalidFiles = files.filter(file => !acceptedTypes.includes(file.type));
    if (invalidFiles.length > 0) {
      alert(`Invalid file types: ${invalidFiles.map(f => f.name).join(', ')}`);
      return;
    }

    // Limit number of files
    const finalFiles = multiple ? files.slice(0, maxFiles) : [files[0]];
    setSelectedFiles(finalFiles);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    resetProgress();
    
    try {
      const results = await uploadMultipleImages(selectedFiles);
      
      const successfulUploads = results
        .filter(result => result.success)
        .map(result => result.url!)
        .filter(Boolean);

      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        console.error('Some uploads failed:', failedUploads);
        alert(`${failedUploads.length} uploads failed. Check console for details.`);
      }

      if (successfulUploads.length > 0) {
        setUploadedUrls(prev => [...prev, ...successfulUploads]);
        onUpload(successfulUploads);
      }

      // Clear selected files
      setSelectedFiles([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeUploadedImage = (url: string) => {
    setUploadedUrls(prev => prev.filter(u => u !== url));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Selection */}
      <div className="flex items-center gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          multiple={multiple}
          onChange={handleFileSelect}
          className="flex-1"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
        >
          <Upload className="w-4 h-4 mr-2" />
          Select {multiple ? 'Images' : 'Image'}
        </Button>
      </div>

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files:</h4>
          <div className="space-y-1">
            {selectedFiles.map((file, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  <span className="text-sm">{file.name}</span>
                  <span className="text-xs text-gray-500">
                    ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
                <Button
                  onClick={() => removeFile(index)}
                  variant="ghost"
                  size="sm"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {uploadProgress.uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(uploadProgress.progress)}%</span>
          </div>
          <Progress value={uploadProgress.progress} />
        </div>
      )}

      {/* Upload Error */}
      {uploadProgress.error && (
        <Alert variant="destructive">
          <AlertDescription>{uploadProgress.error}</AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      <Button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || uploadProgress.uploading}
        className="w-full"
      >
        {uploadProgress.uploading ? 'Uploading...' : `Upload ${selectedFiles.length} Image${selectedFiles.length !== 1 ? 's' : ''}`}
      </Button>

      {/* Uploaded Images Preview */}
      {uploadedUrls.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Uploaded Images:</h4>
          <div className="grid grid-cols-3 gap-2">
            {uploadedUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-20 object-cover rounded border"
                />
                <Button
                  onClick={() => removeUploadedImage(url)}
                  variant="destructive"
                  size="sm"
                  className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
