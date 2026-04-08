import { useState, useCallback } from 'react';

interface BlockchainRecordParams {
  batchId: string;
  stageName: string;
  imageUrl: string;
  isFirstImage: boolean;
  farmerDetails: {
    name: string;
    location: string;
  };
  batchDetails?: {
    cropType: string;
    quantity: number;
    unit: string;
  };
}

interface BlockchainResponse {
  success: boolean;
  transactionId?: string;
  blockNumber?: number;
  imageHash?: string;
  timestamp?: string;
  stage?: string;
  verifiedBy?: string;
  batchData?: any;
  error?: string;
}

export function useBlockchainRecord() {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const recordToBlockchain = useCallback(async (
    params: BlockchainRecordParams
  ): Promise<BlockchainResponse> => {
    setRecording(true);
    setError(null);

    try {
      console.log('🔗 Recording to blockchain:', {
        batchId: params.batchId,
        stageName: params.stageName,
        isFirstImage: params.isFirstImage
      });

      const response = await fetch('/api/blockchain/record-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        const errorMsg = result.error || 'Failed to record on blockchain';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      }

      console.log('✅ Blockchain record successful:', {
        transactionId: result.transactionId,
        blockNumber: result.blockNumber
      });

      setRecording(false);
      return result;

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('❌ Blockchain recording error:', err);
      setError(errorMsg);
      setRecording(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  const recordFirstImage = useCallback(async (
    batchId: string,
    imageUrl: string,
    farmerName: string,
    location: string,
    cropType: string,
    quantity: number,
    unit: string,
    stageName: string = 'Land Preparation'
  ): Promise<BlockchainResponse> => {
    return recordToBlockchain({
      batchId,
      stageName,
      imageUrl,
      isFirstImage: true,
      farmerDetails: {
        name: farmerName,
        location
      },
      batchDetails: {
        cropType,
        quantity,
        unit
      }
    });
  }, [recordToBlockchain]);

  const recordSubsequentImage = useCallback(async (
    batchId: string,
    imageUrl: string,
    stageName: string,
    farmerName: string,
    location: string
  ): Promise<BlockchainResponse> => {
    return recordToBlockchain({
      batchId,
      stageName,
      imageUrl,
      isFirstImage: false,
      farmerDetails: {
        name: farmerName,
        location
      }
    });
  }, [recordToBlockchain]);

  return {
    recordToBlockchain,
    recordFirstImage,
    recordSubsequentImage,
    recording,
    error,
  };
}
