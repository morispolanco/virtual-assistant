
import React, { useState, useRef, useCallback } from 'react';
import CameraView, { type CameraViewHandle } from './components/CameraView';
import ActionButton from './components/ActionButton';
import StatusDisplay from './components/StatusDisplay';
import { useSpeech } from './hooks/useSpeech';
import * as geminiService from './services/geminiService';
import type { Status } from './types';

// Icons as SVG components
const TextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
    </svg>
);

const SceneIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
);

const MicIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
);


const App: React.FC = () => {
  const [status, setStatus] = useState<Status>('initializing');
  const [message, setMessage] = useState('');
  const cameraRef = useRef<CameraViewHandle>(null);

  const handleListenResult = useCallback(async (transcript: string) => {
    setStatus('processing');
    setMessage(`Analizando: "${transcript}"`);
    const imageBase64 = cameraRef.current?.captureFrame();
    if (!imageBase64) {
      handleError('No se pudo capturar la imagen de la cámara.');
      return;
    }
    try {
      const response = await geminiService.askQuestionAboutImage(imageBase64, transcript);
      setMessage(response);
      speak(response, () => setStatus('ready'));
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Error desconocido');
    }
  }, []);

  const { isListening, isSpeaking, speak, startListening, cancelSpeech } = useSpeech(handleListenResult);
  
  const isBusy = status === 'processing' || status === 'speaking' || status === 'listening' || status === 'capturing';

  const handleError = useCallback((errorMessage: string) => {
    setStatus('error');
    setMessage(errorMessage);
    speak(errorMessage, () => {
        setTimeout(() => setStatus('ready'), 2000);
    });
  }, [speak]);

  const handleCameraReady = () => setStatus('ready');
  const handleCameraError = (errMessage: string) => handleError(errMessage);

  const handleAction = async (action: () => Promise<string>) => {
    if (isBusy) {
        cancelSpeech();
        return;
    };

    setStatus('capturing');
    const imageBase64 = cameraRef.current?.captureFrame();
    if (!imageBase64) {
      handleError('No se pudo capturar la imagen de la cámara.');
      return;
    }
    
    setStatus('processing');
    try {
      const response = await action();
      setMessage(response);
      setStatus('speaking');
      speak(response, () => setStatus('ready'));
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Error desconocido');
    }
  };

  const handleReadText = () => handleAction(async () => {
    const imageBase64 = cameraRef.current!.captureFrame()!;
    return geminiService.readTextFromImage(imageBase64);
  });

  const handleDescribeScene = () => handleAction(async () => {
    const imageBase64 = cameraRef.current!.captureFrame()!;
    return geminiService.describeSceneFromImage(imageBase64);
  });

  const handleConverse = () => {
    if (isBusy) {
      cancelSpeech();
      setStatus('ready');
      return;
    }
    setStatus('listening');
    startListening();
  };
  
  return (
    <div className="w-screen h-screen flex flex-col">
      <CameraView ref={cameraRef} onReady={handleCameraReady} onError={handleCameraError} />
      
      <div className="absolute inset-0 bg-black bg-opacity-30 z-10"></div>
      
      <main className="relative z-20 flex flex-col flex-grow justify-between h-full">
        <StatusDisplay status={status} message={message} />

        <div className="flex-grow"></div>

        <footer className="w-full p-4 sm:p-6 bg-black bg-opacity-70 backdrop-blur-sm">
          <div className="container mx-auto flex justify-around items-center space-x-2">
            <ActionButton 
              onClick={handleReadText}
              label="Leer Texto"
              ariaLabel="Escanear y leer texto"
              disabled={isBusy}
            >
                <TextIcon/>
            </ActionButton>
            <ActionButton 
              onClick={handleDescribeScene}
              label="Describir"
              ariaLabel="Describir entorno"
              disabled={isBusy}
            >
                <SceneIcon/>
            </ActionButton>
            <ActionButton 
              onClick={handleConverse}
              label="Preguntar"
              ariaLabel="Iniciar conversación"
              disabled={isSpeaking || status === 'processing'}
              isActive={isListening}
            >
                <MicIcon/>
            </ActionButton>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
