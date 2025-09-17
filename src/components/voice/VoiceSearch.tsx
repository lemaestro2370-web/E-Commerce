import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Search, X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/supabase';

interface VoiceSearchProps {
  onSearch?: (query: string) => void;
  onTranscript?: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  onClose?: () => void;
  placeholder?: string;
  className?: string;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const VoiceSearch: React.FC<VoiceSearchProps> = ({
  onSearch,
  onTranscript,
  onListeningChange,
  onClose,
  placeholder = "Say something to search...",
  className = ""
}) => {
  const { language, user } = useStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);
  const sessionId = useRef(crypto.randomUUID());

  const translations = {
    en: {
      startListening: 'Start Voice Search',
      stopListening: 'Stop Listening',
      listening: 'Listening...',
      processing: 'Processing...',
      speak: 'Speak now',
      tryAgain: 'Try Again',
      search: 'Search',
      clear: 'Clear',
      notSupported: 'Voice search not supported in this browser',
      permissionDenied: 'Microphone permission denied',
      noSpeech: 'No speech detected. Please try again.',
      networkError: 'Network error. Please check your connection.',
      confidence: 'Confidence',
      transcript: 'What you said',
      searchFor: 'Search for',
    },
    fr: {
      startListening: 'Démarrer la Recherche Vocale',
      stopListening: 'Arrêter l\'Écoute',
      listening: 'Écoute...',
      processing: 'Traitement...',
      speak: 'Parlez maintenant',
      tryAgain: 'Réessayer',
      search: 'Rechercher',
      clear: 'Effacer',
      notSupported: 'Recherche vocale non supportée dans ce navigateur',
      permissionDenied: 'Permission du microphone refusée',
      noSpeech: 'Aucune parole détectée. Veuillez réessayer.',
      networkError: 'Erreur réseau. Vérifiez votre connexion.',
      confidence: 'Confiance',
      transcript: 'Ce que vous avez dit',
      searchFor: 'Rechercher',
    }
  };

  const t = translations[language];

  useEffect(() => {
    // Check if speech recognition is supported
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      // Event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError('');
        setTranscript('');
        setConfidence(0);
        onListeningChange?.(true);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        const currentTranscript = finalTranscript || interimTranscript;
        setTranscript(currentTranscript);
        
        // Call onTranscript callback for real-time updates
        if (currentTranscript && onTranscript) {
          onTranscript(currentTranscript);
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
        onListeningChange?.(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        setIsListening(false);
        setIsProcessing(false);
        onListeningChange?.(false);
        
        switch (event.error) {
          case 'not-allowed':
            setError(t.permissionDenied);
            break;
          case 'no-speech':
            setError(t.noSpeech);
            break;
          case 'network':
            setError(t.networkError);
            break;
          default:
            setError(`Error: ${event.error}`);
        }
      };
    } else {
      setIsSupported(false);
      setError(t.notSupported);
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [language, t]);

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return;
    
    setError('');
    setTranscript('');
    setConfidence(0);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setError('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSearch = async () => {
    if (!transcript.trim()) return;
    
    setIsProcessing(true);
    
    try {
      // Process voice commands
      const processedQuery = processVoiceCommands(transcript.trim());
      
      // Log voice search for analytics
      if (user) {
        await db.logVoiceSearch({
          user_id: user.id,
          search_query: transcript,
          transcription_confidence: confidence,
          session_id: sessionId.current
        });
      }
      
      // Call both callbacks if provided
      onSearch?.(processedQuery);
      onTranscript?.(processedQuery);
      
      // Clear transcript after search
      setTimeout(() => {
        setTranscript('');
        setConfidence(0);
      }, 1000);
      
    } catch (error) {
      console.error('Error logging voice search:', error);
      // Still perform search even if logging fails
      onSearch?.(transcript.trim());
      onTranscript?.(transcript.trim());
    } finally {
      setIsProcessing(false);
    }
  };

  const processVoiceCommands = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Navigation commands
    if (lowerQuery.includes('go to') || lowerQuery.includes('navigate to')) {
      if (lowerQuery.includes('home') || lowerQuery.includes('main page')) {
        window.location.href = '/';
        return 'Navigating to home page';
      }
      if (lowerQuery.includes('shop') || lowerQuery.includes('products')) {
        window.location.href = '/shop';
        return 'Navigating to shop';
      }
      if (lowerQuery.includes('cart') || lowerQuery.includes('basket')) {
        // Trigger cart modal
        const cartButton = document.querySelector('[data-cart-button]') as HTMLButtonElement;
        if (cartButton) cartButton.click();
        return 'Opening cart';
      }
      if (lowerQuery.includes('orders') || lowerQuery.includes('my orders')) {
        window.location.href = '/orders';
        return 'Navigating to orders';
      }
      if (lowerQuery.includes('profile') || lowerQuery.includes('account')) {
        window.location.href = '/profile';
        return 'Navigating to profile';
      }
    }
    
    // Search commands
    if (lowerQuery.includes('search for') || lowerQuery.includes('find')) {
      const searchTerm = query.replace(/search for|find/gi, '').trim();
      return searchTerm;
    }
    
    // Product category commands
    if (lowerQuery.includes('show me') || lowerQuery.includes('display')) {
      if (lowerQuery.includes('electronics') || lowerQuery.includes('electronic')) {
        return 'electronics';
      }
      if (lowerQuery.includes('clothing') || lowerQuery.includes('clothes')) {
        return 'clothing';
      }
      if (lowerQuery.includes('food') || lowerQuery.includes('groceries')) {
        return 'food';
      }
      if (lowerQuery.includes('books') || lowerQuery.includes('book')) {
        return 'books';
      }
    }
    
    // Price range commands
    if (lowerQuery.includes('under') || lowerQuery.includes('less than')) {
      const priceMatch = query.match(/(\d+)/);
      if (priceMatch) {
        return `under ${priceMatch[1]} FCFA`;
      }
    }
    
    if (lowerQuery.includes('between') || lowerQuery.includes('from')) {
      const priceMatches = query.match(/(\d+).*?(\d+)/);
      if (priceMatches) {
        return `${priceMatches[1]} to ${priceMatches[2]} FCFA`;
      }
    }
    
    // Sort commands
    if (lowerQuery.includes('sort by') || lowerQuery.includes('order by')) {
      if (lowerQuery.includes('price') && lowerQuery.includes('low')) {
        return 'sort:price:asc';
      }
      if (lowerQuery.includes('price') && lowerQuery.includes('high')) {
        return 'sort:price:desc';
      }
      if (lowerQuery.includes('newest') || lowerQuery.includes('latest')) {
        return 'sort:date:desc';
      }
      if (lowerQuery.includes('popular') || lowerQuery.includes('best selling')) {
        return 'sort:popular:desc';
      }
    }
    
    // Return original query if no commands matched
    return query;
  };

  const clearTranscript = () => {
    setTranscript('');
    setConfidence(0);
    setError('');
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'fr' ? 'fr-FR' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-red-700">
          <MicOff className="w-5 h-5" />
          <span className="text-sm font-medium">{t.notSupported}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg border p-6 max-w-md mx-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Voice Search</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Voice Input Area */}
      <div className="text-center mb-6">
        <div className={`
          w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center transition-all duration-300
          ${isListening 
            ? 'bg-red-100 border-4 border-red-300 animate-pulse' 
            : 'bg-blue-100 border-4 border-blue-300 hover:bg-blue-200'
          }
        `}>
          <Button
            variant="ghost"
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className="w-full h-full rounded-full p-0"
          >
            {isProcessing ? (
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-8 h-8 text-red-600" />
            ) : (
              <Mic className="w-8 h-8 text-blue-600" />
            )}
          </Button>
        </div>

        <p className="text-sm text-gray-600 mb-2">
          {isListening ? t.listening : isProcessing ? t.processing : t.speak}
        </p>

        {isListening && (
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-1 h-4 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t.transcript}:</span>
            {confidence > 0 && (
              <span className="text-xs text-gray-500">
                {t.confidence}: {Math.round(confidence * 100)}%
              </span>
            )}
          </div>
          <p className="text-gray-900">{transcript}</p>
          
          <div className="flex items-center space-x-2 mt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText(transcript)}
              className="text-blue-600"
            >
              <Volume2 className="w-4 h-4 mr-1" />
              Play
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTranscript}
              className="text-gray-600"
            >
              <X className="w-4 h-4 mr-1" />
              {t.clear}
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={startListening}
            className="mt-2 text-red-600"
          >
            {t.tryAgain}
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-2">
        <Button
          variant="primary"
          onClick={handleSearch}
          disabled={!transcript.trim() || isProcessing}
          className="flex-1"
        >
          <Search className="w-4 h-4 mr-2" />
          {t.search}
        </Button>
        
        <Button
          variant="ghost"
          onClick={isListening ? stopListening : startListening}
          disabled={isProcessing}
        >
          {isListening ? (
            <MicOff className="w-4 h-4" />
          ) : (
            <Mic className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>Click the microphone and speak clearly.</p>
        <p>Supported languages: English, French</p>
      </div>
    </div>
  );
};