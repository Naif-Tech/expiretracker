import { useState, useRef, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, X, Keyboard, Camera } from "lucide-react";

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (barcode: string) => void;
}

export default function BarcodeScanner({ isOpen, onClose, onScan }: BarcodeScannerProps) {
  const [manualMode, setManualMode] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Camera access error:", error);
      alert("لا يمكن الوصول إلى الكاميرا. استخدم الإدخال اليدوي.");
      setManualMode(true);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  }, []);

  const handleManualSubmit = useCallback(() => {
    if (manualBarcode.trim()) {
      onScan(manualBarcode.trim());
      setManualBarcode("");
      onClose();
    }
  }, [manualBarcode, onScan, onClose]);

  // Cleanup camera when modal closes
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setManualMode(false);
      setManualBarcode("");
    }
  }, [isOpen, stopCamera]);

  // Auto-start camera when not in manual mode
  useEffect(() => {
    if (isOpen && !manualMode && !isCameraActive) {
      startCamera();
    }
  }, [isOpen, manualMode, isCameraActive, startCamera]);

  // Mock barcode detection (in real implementation, use a barcode scanning library)
  const simulateBarcodeDetection = useCallback(() => {
    // This would be replaced with actual barcode detection
    const mockBarcode = Math.random().toString().substr(2, 12);
    onScan(mockBarcode);
    onClose();
  }, [onScan, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 p-0 overflow-hidden" dir="rtl">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic flex items-center justify-between">
            <span>مسح الباركود</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {!manualMode ? (
          <div className="relative bg-black">
            {!isCameraActive ? (
              <div className="aspect-[4/3] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                <div className="text-center">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400 font-arabic mb-4">
                    اضغط لبدء مسح الباركود
                  </p>
                  <div className="space-y-3">
                    <Button onClick={startCamera} className="bg-primary hover:bg-primary/90 font-arabic">
                      <Camera className="w-4 h-4 ml-2" />
                      تشغيل الكاميرا
                    </Button>
                    <br />
                    <Button 
                      variant="outline" 
                      onClick={() => setManualMode(true)}
                      className="font-arabic"
                    >
                      <Keyboard className="w-4 h-4 ml-2" />
                      إدخال يدوي
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative aspect-[4/3]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                {/* Barcode scanning overlay */}
                <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-20 border-2 border-red-500 bg-red-500/10">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-500"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-500"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-500"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-500"></div>
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-red-500 animate-pulse"></div>
                  </div>
                  <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-white text-center">
                    <p className="font-arabic bg-black/50 px-3 py-1 rounded">
                      ضع الباركود في المنطقة المحددة
                    </p>
                  </div>
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-reverse space-x-4">
                  <Button
                    onClick={() => setManualMode(true)}
                    variant="outline"
                    size="sm"
                    className="bg-white/90 text-black hover:bg-white font-arabic"
                  >
                    <Keyboard className="w-4 h-4 ml-1" />
                    يدوي
                  </Button>
                  <Button
                    onClick={simulateBarcodeDetection}
                    size="sm"
                    className="bg-green-500 hover:bg-green-600 text-white font-arabic"
                  >
                    محاكاة مسح
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="space-y-4">
              <div className="text-center">
                <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-arabic mb-4">
                  أدخل رقم الباركود يدوياً
                </p>
              </div>
              
              <div className="space-y-4">
                <Input
                  type="text"
                  placeholder="أدخل رقم الباركود..."
                  value={manualBarcode}
                  onChange={(e) => setManualBarcode(e.target.value)}
                  className="text-center text-lg tracking-wider"
                  onKeyPress={(e) => e.key === 'Enter' && handleManualSubmit()}
                />
                
                <div className="flex space-x-reverse space-x-3">
                  <Button
                    variant="outline"
                    className="flex-1 font-arabic"
                    onClick={() => setManualMode(false)}
                  >
                    <Camera className="w-4 h-4 ml-2" />
                    عودة للكاميرا
                  </Button>
                  <Button
                    onClick={handleManualSubmit}
                    disabled={!manualBarcode.trim()}
                    className="flex-1 bg-primary hover:bg-primary/90 font-arabic"
                  >
                    تأكيد
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}