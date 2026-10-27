import React, { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { XCircle, Camera } from 'lucide-react';

interface QRScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ onScan, onClose }) => {
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Create scanner instance
    const scanner = new Html5QrcodeScanner(
      "reader",
      { 
        fps: 10, 
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      },
      false
    );

    const onScanSuccess = (decodedText: string) => {
      scanner.clear().then(() => {
        onScan(decodedText);
      }).catch((err) => {
        console.error("Failed to clear scanner", err);
        onScan(decodedText);
      });
    };

    const onScanFailure = (err: any) => {
      // Handle scan failure, usually better to ignore frame errors as they happen constantly when no QR is present
      // console.warn(err);
    };

    scanner.render(onScanSuccess, onScanFailure);

    // Cleanup
    return () => {
      scanner.clear().catch(err => console.error("Failed to clear scanner on unmount", err));
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="p-4 bg-gray-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5" />
            <h2 className="font-bold">Scan Outpass</h2>
          </div>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition-colors">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-6 bg-white">
          <div id="reader" className="overflow-hidden rounded-lg border-2 border-dashed border-gray-300"></div>
          <p className="text-center text-sm text-gray-500 mt-4 font-medium">
            Point camera at the student's digital outpass QR code
          </p>
        </div>
      </div>
    </div>
  );
};