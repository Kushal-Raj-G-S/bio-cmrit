import { useState, useCallback } from 'react';

interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}

interface UploadProgress {
  uploading: boolean;
  progress: number;
  error?: string;
}

export function useImageUpload() {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({
    uploading: false,
    progress: 0,
  });

  const uploadImage = useCallback(async (file: File): Promise<UploadResult> => {
    setUploadProgress({ uploading: true, progress: 0 });

    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', file);

      // Upload to Supabase via API
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setUploadProgress({ uploading: false, progress: 100 });
      return { success: true, url: result.url };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setUploadProgress({ uploading: false, progress: 0, error: errorMessage });
      return { success: false, error: errorMessage };
    }
  }, []);

  const uploadMultipleImages = useCallback(async (files: File[]): Promise<UploadResult[]> => {
    const results: UploadResult[] = [];
    
    setUploadProgress({ uploading: true, progress: 0 });
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progressPercent = (i / files.length) * 100;
      
      setUploadProgress({ 
        uploading: true, 
        progress: progressPercent 
      });
      
      const result = await uploadImage(file);
      results.push(result);
      
      // Small delay between uploads to prevent overwhelming the server
      if (i < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    setUploadProgress({ uploading: false, progress: 100 });
    return results;
  }, [uploadImage]);

  const deleteImage = useCallback(async (fileName: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/upload?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      return result.success || false;
    } catch (error) {
      console.error('Delete error:', error);
      return false;
    }
  }, []);

  const resetProgress = useCallback(() => {
    setUploadProgress({ uploading: false, progress: 0 });
  }, []);

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    uploadProgress,
    resetProgress,
  };
}
