'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Camera, Upload, X, Scan } from 'lucide-react';
import { toast } from 'sonner';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function QRScanner({ onScan, onError, className }: QRScannerProps): React.JSX.Element {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [manualInput, setManualInput] = useState<string>('');
  const [scanMode, setScanMode] = useState<'camera' | 'upload' | 'manual'>('camera');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerDivRef = useRef<HTMLDivElement>(null);

  const handleScanSuccess = (decodedText: string): void => {
    console.log('QR Scan Success:', decodedText);
    onScan(decodedText);
    toast.success('QR code scanned successfully!');
    stopScanning();
  };

  const handleScanError = (errorMessage: string): void => {
    console.warn('QR Scan Error:', errorMessage);
    // Don't show error toast for every scan attempt, only for critical errors
    if (onError) {
      onError(errorMessage);
    }
  };

  const startScanning = (): void => {
    if (scannerDivRef.current && !scannerRef.current) {
      setIsScanning(true);
      scannerRef.current = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );
      scannerRef.current.render(handleScanSuccess, handleScanError);
    }
  };

  const stopScanning = (): void => {
    if (scannerRef.current) {
      scannerRef.current.clear();
      scannerRef.current = null;
      setIsScanning(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (file) {
      // For demo purposes, we'll simulate QR reading from file
      const reader = new FileReader();
      reader.onload = () => {
        // Simulate QR detection (in real app, you'd use a QR library)
        const mockBatchId = 'FB' + Math.random().toString(36).substr(2, 3).toUpperCase();
        setTimeout(() => {
          onScan(mockBatchId);
          toast.success('QR code detected from image!');
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualSubmit = (): void => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      toast.success('Batch ID submitted successfully!');
      setManualInput('');
    } else {
      toast.error('Please enter a valid batch ID');
    }
  };

  const simulateQRScan = (): void => {
    // Simulate scanning a QR code for demo purposes
    const mockBatchIds = ['FB001', 'FB002', 'MB001', 'MB002'];
    const randomId = mockBatchIds[Math.floor(Math.random() * mockBatchIds.length)];
    
    setTimeout(() => {
      onScan(randomId);
      toast.success('Demo QR code scanned!');
    }, 1500);
  };

  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scan className="h-5 w-5" />
          QR Code Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Scan Mode Selector */}
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <Button
            variant={scanMode === 'camera' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScanMode('camera')}
            className="flex-1"
          >
            <Camera className="h-4 w-4 mr-2" />
            Camera
          </Button>
          <Button
            variant={scanMode === 'upload' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScanMode('upload')}
            className="flex-1"
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload
          </Button>
          <Button
            variant={scanMode === 'manual' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setScanMode('manual')}
            className="flex-1"
          >
            Manual
          </Button>
        </div>

        {/* Camera Mode */}
        {scanMode === 'camera' && (
          <div className="space-y-4">
            <div className="bg-gray-100 rounded-lg p-4 text-center">
              <div id="qr-reader" ref={scannerDivRef} className="w-full" />
              {!isScanning && (
                <div className="py-8">
                  <Camera className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600 mb-4">Click start to begin scanning</p>
                  <Button onClick={startScanning} className="gap-2">
                    <Camera className="h-4 w-4" />
                    Start Camera
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {isScanning ? (
                <Button onClick={stopScanning} variant="outline" className="flex-1 gap-2">
                  <X className="h-4 w-4" />
                  Stop Scanning
                </Button>
              ) : (
                <Button onClick={simulateQRScan} variant="outline" className="flex-1 gap-2">
                  <Scan className="h-4 w-4" />
                  Demo Scan
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Upload Mode */}
        {scanMode === 'upload' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="qr-upload">Upload QR Code Image</Label>
              <Input
                id="qr-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="mt-2"
              />
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                Upload an image containing a QR code to extract the batch information.
              </p>
            </div>
          </div>
        )}

        {/* Manual Mode */}
        {scanMode === 'manual' && (
          <div className="space-y-4">
            <div>
              <Label htmlFor="batch-id">Enter Batch ID</Label>
              <Input
                id="batch-id"
                placeholder="e.g., FB001, MB002"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="mt-2"
              />
            </div>
            <Button onClick={handleManualSubmit} className="w-full gap-2">
              <Scan className="h-4 w-4" />
              Verify Batch
            </Button>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Enter the batch ID directly if you can&apos;t scan the QR code.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
