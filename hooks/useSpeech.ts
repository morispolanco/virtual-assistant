
import { useState, useCallback, useRef } from 'react';

// --- Type definitions for Web Speech API to fix TypeScript errors ---
// This is necessary because these types are not part of the standard DOM library in TypeScript.
interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

// Define the main SpeechRecognition interface
interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onstart: ((this: SpeechRecognition, ev: Event) => any) | null;
  onend: ((this: SpeechRecognition, ev: Event) => any) | null;
  onerror: ((this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => any) | null;
  onresult: ((this: SpeechRecognition, ev: SpeechRecognitionEvent) => any) | null;
  start(): void;
  stop(): void;
}

// Define the constructor type
interface SpeechRecognitionStatic {
  new(): SpeechRecognition;
}
// --- End of type definitions ---


// Polyfill for cross-browser compatibility, now correctly typed.
const SpeechRecognition: SpeechRecognitionStatic | undefined =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export const useSpeech = (onListenResult: (transcript: string) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  // This ref will now correctly use the SpeechRecognition interface type
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const speak = useCallback((text: string, onEnd: () => void) => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      onEnd();
    };
    utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd();
    };
    window.speechSynthesis.speak(utterance);
  }, [isSpeaking]);

  const cancelSpeech = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      alert("La API de reconocimiento de voz no es compatible con este navegador.");
      return;
    }
    if (isListening) return;

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.lang = 'es-ES';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onListenResult(transcript);
    };

    recognition.start();
  }, [isListening, onListenResult]);

  return {
    isListening,
    isSpeaking,
    speak,
    startListening,
    cancelSpeech,
  };
};
