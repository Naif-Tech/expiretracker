import { useState, useRef, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, X, RotateCcw, Check } from "lucide-react";

interface CameraScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

export default function CameraScanner({ isOpen, onClose, onCapture }: CameraScannerProps) {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment', // Use back camera on mobile
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
      alert("لا يمكن الوصول إلى الكاميرا. تأكد من منح الإذن للتطبيق.");
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
    setCapturedImage(null);
  }, []);

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
      }
    }
  }, []);

  const confirmCapture = useCallback(() => {
    if (capturedImage) {
      onCapture(capturedImage);
      stopCamera();
      onClose();
    }
  }, [capturedImage, onCapture, stopCamera, onClose]);

  const retakePhoto = useCallback(() => {
    setCapturedImage(null);
  }, []);

  // Auto-start camera when modal opens
  useState(() => {
    if (isOpen && !isCameraActive && !capturedImage) {
      startCamera();
    }
  });

  // Cleanup camera when modal closes
  useState(() => {
    if (!isOpen) {
      stopCamera();
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md w-full mx-4 p-0 overflow-hidden" dir="rtl">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100 font-arabic flex items-center justify-between">
            <span>التقط صورة المنتج</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="relative bg-black">
          {!isCameraActive && !capturedImage && (
            <div className="aspect-[4/3] flex items-center justify-center bg-gray-100 dark:bg-gray-800">
              <div className="text-center">
                <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 font-arabic mb-4">
                  اضغط لبدء تشغيل الكاميرا
                </p>
                <Button onClick={startCamera} className="bg-primary hover:bg-primary/90 font-arabic">
                  <Camera className="w-4 h-4 ml-2" />
                  تشغيل الكاميرا
                </Button>
              </div>
            </div>
          )}

          {isCameraActive && !capturedImage && (
            <div className="relative aspect-[4/3]">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 pointer-events-none">
                {/* Camera overlay guides */}
                <div className="absolute inset-4 border-2 border-white/50 rounded-lg"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full"></div>
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-reverse space-x-4">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100 rounded-full w-16 h-16"
                >
                  <Camera className="w-8 h-8" />
                </Button>
              </div>
            </div>
          )}

          {capturedImage && (
            <div className="relative aspect-[4/3]">
              <img
                src={capturedImage}
                alt="Captured product"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-reverse space-x-4">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  size="lg"
                  className="bg-white/90 text-black hover:bg-white rounded-full"
                >
                  <RotateCcw className="w-5 h-5" />
                </Button>
                <Button
                  onClick={confirmCapture}
                  size="lg"
                  className="bg-green-500 hover:bg-green-600 text-white rounded-full"
                >
                  <Check className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {isCameraActive && (
          <div className="p-4 pt-0">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center font-arabic">
              ضع المنتج في إطار الكاميرا واضغط على زر التصوير
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}