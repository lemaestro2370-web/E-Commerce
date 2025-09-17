import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { Download, Copy, Check } from 'lucide-react';
import { Button } from './Button';

interface QRCodeGeneratorProps {
  orderId: string;
  orderData: {
    id: string;
    total: number;
    status: string;
    created_at: string;
    user_email?: string;
  };
  onClose?: () => void;
}

export const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  orderId,
  orderData,
  onClose
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, [orderId, orderData]);

  const generateQRCode = async () => {
    if (!canvasRef.current) return;

    try {
      // Create QR code data with order information
      const qrData = {
        orderId: orderData.id,
        total: orderData.total,
        status: orderData.status,
        date: orderData.created_at,
        user: orderData.user_email || 'Unknown',
        timestamp: Date.now()
      };

      const qrString = JSON.stringify(qrData);
      
      // Generate QR code
      const dataUrl = await QRCode.toDataURL(qrString, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrCodeDataUrl(dataUrl);

      // Draw on canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const img = new Image();
        img.onload = () => {
          canvas.width = 300;
          canvas.height = 300;
          ctx.drawImage(img, 0, 0);
        };
        img.src = dataUrl;
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const downloadQRCode = () => {
    if (qrCodeDataUrl) {
      const link = document.createElement('a');
      link.download = `order-${orderId}-qr.png`;
      link.href = qrCodeDataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const copyQRData = async () => {
    try {
      const qrData = {
        orderId: orderData.id,
        total: orderData.total,
        status: orderData.status,
        date: orderData.created_at,
        user: orderData.user_email || 'Unknown',
        timestamp: Date.now()
      };
      
      await navigator.clipboard.writeText(JSON.stringify(qrData, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying QR data:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order QR Code</h2>
          <p className="text-gray-600 mb-6">Scan this QR code to view order details</p>
          
          {/* QR Code Canvas */}
          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              className="border-2 border-gray-200 rounded-lg"
              style={{ width: '300px', height: '300px' }}
            />
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-gray-900 mb-2">Order Information</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">Order ID:</span> {orderData.id}</p>
              <p><span className="font-medium">Total:</span> {orderData.total.toLocaleString()} FCFA</p>
              <p><span className="font-medium">Status:</span> {orderData.status}</p>
              <p><span className="font-medium">Date:</span> {new Date(orderData.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={downloadQRCode}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
            
            <Button
              onClick={copyQRData}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Data
                </>
              )}
            </Button>
          </div>

          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              className="mt-4 w-full"
            >
              Close
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
