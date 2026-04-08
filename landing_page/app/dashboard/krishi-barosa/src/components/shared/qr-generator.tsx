'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import QRCode from 'qrcode';

interface QRGeneratorProps {
  data: string;
  title?: string;
  size?: number;
  className?: string;
}

export function QRGenerator({ data, title = 'QR Code', size = 256, className }: QRGeneratorProps): React.JSX.Element {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const generateQR = useCallback(async (): Promise<void> => {
    setIsGenerating(true);
    try {
      const url = await QRCode.toDataURL(data, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeUrl(url);
      toast.success('QR code generated successfully!');
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    } finally {
      setIsGenerating(false);
    }
  }, [data, size]);

  const downloadQR = (): void => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_')}_QR.png`;
      link.href = qrCodeUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR code downloaded successfully!');
    }
  };

  useEffect(() => {
    if (data) {
      generateQR();
    }
  }, [data, generateQR]);

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          {title}
          <Button
            variant="outline"
            size="sm"
            onClick={generateQR}
            disabled={isGenerating || !data}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            Regenerate
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            {qrCodeUrl ? (
              <Image
                src={qrCodeUrl}
                alt={`QR Code for ${title}`}
                width={size}
                height={size}
                className="w-full h-auto"
              />
            ) : (
              <div
                className="flex items-center justify-center bg-gray-100 rounded-lg"
                style={{ width: size, height: size }}
              >
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">
                    {isGenerating ? 'Generating...' : 'No QR code'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 font-mono break-all bg-gray-50 p-2 rounded">
            {data || 'No data provided'}
          </p>
          
          <Button
            onClick={downloadQR}
            disabled={!qrCodeUrl}
            className="w-full gap-2 bg-green-600 hover:bg-green-700"
          >
            <Download className="h-4 w-4" />
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
