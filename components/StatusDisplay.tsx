
import React from 'react';
import type { Status } from '../types';

interface StatusDisplayProps {
  status: Status;
  message: string;
}

const StatusIcon: React.FC<{status: Status}> = ({ status }) => {
  switch (status) {
    case 'processing':
    case 'capturing':
      return (
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      );
    case 'listening':
      return (
        <svg className="w-8 h-8 text-red-500 animate-pulse" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      );
    case 'speaking':
       return (
        <svg className="w-8 h-8 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.636 18.364a9 9 0 010-12.728m2.828 9.9a5 5 0 010-7.072M12 6v12" />
        </svg>
      );
    case 'error':
       return (
         <svg className="w-8 h-8 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
         </svg>
       );
    default:
      return null;
  }
};

const StatusDisplay: React.FC<StatusDisplayProps> = ({ status, message }) => {
  const statusMessages: Record<Status, string> = {
    idle: "",
    initializing: "Iniciando cámara...",
    ready: "Listo. Elige una opción.",
    capturing: "Capturando imagen...",
    listening: "Escuchando...",
    processing: "Procesando...",
    speaking: "Hablando...",
    error: "Error",
  };
  
  const displayMessage = status === 'error' ? message : (message || statusMessages[status]);

  return (
    <div
      className="fixed top-0 left-0 right-0 p-4 bg-black bg-opacity-70 backdrop-blur-sm text-center z-20"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="container mx-auto flex items-center justify-center space-x-4 min-h-[4rem]">
        <div className="w-8 h-8 flex-shrink-0">
          <StatusIcon status={status} />
        </div>
        <p className="text-lg font-semibold text-gray-100">{displayMessage}</p>
      </div>
    </div>
  );
};

export default StatusDisplay;
