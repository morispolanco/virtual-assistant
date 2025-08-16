
import React, { useRef, useEffect, useImperativeHandle, forwardRef, useState } from 'react';

interface CameraViewProps {
  onReady: () => void;
  onError: (message: string) => void;
}

export interface CameraViewHandle {
  captureFrame: () => string | null;
}

const CameraView = forwardRef<CameraViewHandle, CameraViewProps>(({ onReady, onError }, ref) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' },
          audio: false,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        setStream(mediaStream);
        onReady();
      } catch (err) {
        console.error("Error accessing camera: ", err);
        onError("No se pudo acceder a la cámara. Por favor, verifica los permisos.");
      }
    };

    getCameraStream();

    return () => {
      stream?.getTracks().forEach(track => track.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useImperativeHandle(ref, () => ({
    captureFrame: () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video && canvas) {
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
          // Return base64 string without the data URL prefix
          return canvas.toDataURL('image/jpeg').split(',')[1];
        }
      }
      return null;
    },
  }));

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        aria-hidden="true"
      ></video>
      <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true"></canvas>
    </div>
  );
});

export default CameraView;