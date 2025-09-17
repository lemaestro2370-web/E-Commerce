import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Search, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/supabase';

interface VoiceSearchProps {
  onSearch?: (query: string) => void;
  onTranscript?: (transcript: string) => void;
  onListeningChange?: (isListening: boolean) => void;
  onClose?: () => void;
  placeholder?: string;
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
}) => {
  const { language, user } = useStore();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const translations = {
    en: {
      startListening: 'Start Voice Search',
      stopListening: 'Stop Listening',
      listening: 'Listening...',
      processing: 'Processing...',
      speak: 'Speak now',
      tryAgain: 'Try Again',
      search: 'Search',
      example: 'Try saying: "Show me skincare products" or "Find red dresses"',
      clear: 'Clear',
      notSupported: 'Voice search not supported in this browser',
      permissionDenied: 'Microphone permission denied',
      noSpeech: 'No speech detected. Please try again.',
      networkError: 'Network error. Please check your connection.',
      confidence: 'Confidence',
      transcript: 'What you said',
      searchFor: 'Search for',
      voiceSearch: 'Voice Search',
    },
    fr: {
      startListening: 'Démarrer la Recherche Vocale',
      stopListening: 'Arrêter l\'Écoute',
      listening: 'Écoute...',
      processing: 'Traitement...',
      speak: 'Parlez maintenant',
      tryAgain: 'Réessayer',
      search: 'Rechercher',
      example: 'Essayez de dire: "Montrez-moi des produits de soin" ou "Trouvez des robes rouges"',
      clear: 'Effacer',
      notSupported: 'Recherche vocale non supportée dans ce navigateur',
      permissionDenied: 'Permission du microphone refusée',
      noSpeech: 'Aucune parole détectée. Veuillez réessayer.',
      networkError: 'Erreur réseau. Vérifiez votre connexion.',
      confidence: 'Confiance',
      transcript: 'Ce que vous avez dit',
      searchFor: 'Rechercher',
      voiceSearch: 'Recherche Vocale',
    }
  };

  const t = translations[language];

  useEffect(() => {
    initializeSpeechRecognition();
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language]);
  
  const initializeSpeechRecognition = () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setIsSupported(false);
        setError(t.notSupported);
        return;
      }

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
        setInterimTranscript('');
        setConfidence(0);
        onListeningChange?.(true);
      };

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let currentInterim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
            setConfidence(result[0].confidence);
          } else {
            currentInterim += result[0].transcript;
          }
        }

        const currentTranscript = finalTranscript || currentInterim;
        setTranscript(currentTranscript);
        setInterimTranscript(currentInterim);
        
        if (finalTranscript) {
          handleSearchResult(finalTranscript, event.results[event.resultIndex][0].confidence || 0);
        }
        
        // Call transcript callback
        if (onTranscript) {
          onTranscript(currentTranscript);
        }
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
          case 'audio-capture':
            setError('Microphone not available. Please check your microphone settings.');
            break;
          case 'not-allowed':
            setError('Microphone access denied. Please allow microphone access and try again.');
            break;
          default:
            setError(`Speech recognition error: ${event.error}`);
        }
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
        setIsProcessing(false);
        onListeningChange?.(false);
      };
      
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setIsSupported(false);
      setError(t.notSupported);
    }
  };

  const handleSearchResult = async (searchQuery: string, confidence: number) => {
    setIsProcessing(true);
    
    try {
      // Process voice commands
      const processedQuery = processVoiceCommands(searchQuery);
      
      // Log voice search for analytics
      if (user) {
        try {
          await db.logVoiceSearch({
            user_id: user.id,
            search_query: processedQuery,
            transcription_confidence: confidence,
            session_id: crypto.randomUUID()
          });
        } catch (logError) {
          console.warn('Could not log voice search:', logError);
        }
      }
      
      // Perform the search
      if (onSearch) {
        onSearch(processedQuery);
      }
      
      // Close the voice search modal after successful search
      setTimeout(() => {
        if (onClose) onClose();
      }, 1000);
      
    } catch (error) {
      console.error('Error processing voice search:', error);
      setError('Failed to process search. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const startListening = () => {
    if (!isSupported || !recognitionRef.current) return;
    
    setError('');
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    
    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
      setError('Failed to start voice recognition. Please try again.');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
    }
  };

  const handleSearch = async () => {
    if (!transcript.trim()) return;
    handleSearchResult(transcript.trim(), confidence);
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
    setInterimTranscript('');
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
      <div className="bg-white rounded-lg shadow-lg border p-6 max-w-md mx-auto">
        <div className="text-center">
          <MicOff className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Voice Search</h3>
          <p className="text-gray-600">{t.notSupported}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-200 p-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-2xl font-bold text-gray-900">🎤 Voice Search</h3>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        )}
      </div>

      {/* Voice Input Area */}
      <div className="text-center mb-6">
        <div className={`
          w-32 h-32 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl
          ${isListening 
            ? 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 animate-pulse' 
            : isProcessing
            ? 'bg-gradient-to-r from-yellow-500 to-orange-500'
            : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'
          }
          text-white hover:shadow-2xl transform hover:scale-110
        `}>
          <Button
            variant="ghost"
            size="lg"
            onClick={isListening ? stopListening : startListening}
            disabled={isProcessing}
            className="w-full h-full rounded-full p-0 text-white hover:bg-transparent"
          >
            {isProcessing ? (
              <Loader2 className="w-10 h-10 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-10 h-10" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </Button>
        </div>

        <p className="text-lg font-semibold text-gray-700 mb-4">
          {isProcessing ? t.processing : isListening ? t.listening : t.speak}
        </p>

        {isListening && (
          <div className="flex justify-center space-x-1">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="w-2 h-6 bg-red-500 rounded-full animate-pulse"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <div className="mb-6 p-6 bg-white rounded-2xl shadow-inner border-2 border-gray-100">
          <p className="text-sm font-semibold text-gray-600 mb-3">{t.searchFor}:</p>
          <p className="font-bold text-lg text-gray-900 mb-3">{transcript || interimTranscript}</p>
          
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">{t.confidence}: {Math.round(confidence * 100)}%</p>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${confidence * 100}%` }}
              ></div>
            </div>
          </div>
          
          <div className="flex space-x-2 mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speakText(transcript || interimTranscript)}
              className="flex items-center space-x-1"
            >
              <Volume2 className="w-4 h-4" />
              <span>Play</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearTranscript}
              className="flex items-center space-x-1"
            >
              <span>Clear</span>
            </Button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-2xl">
          <p className="text-red-700 font-medium">{error}</p>
          <Button
            variant="ghost"
            size="sm"
            onClick={startListening}
            className="mt-2 text-red-600 hover:bg-red-100"
          >
            {t.tryAgain}
          </Button>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <Button
          variant="ghost"
          onClick={onClose}
          disabled={isProcessing}
          className="flex-1 border-2 border-gray-300 hover:border-gray-400"
        >
          Close
        </Button>
        
        <Button
          onClick={handleSearch}
          disabled={!transcript.trim() || isProcessing}
          className="flex-1 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white font-bold"
        >
          {isProcessing ? (
            <div className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t.processing}
            </div>
          ) : (
            <div className="flex items-center justify-center">
              <Search className="w-4 h-4 mr-2" />
              {t.search}
            </div>
          )}
        </Button>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl border border-blue-200">
        <h4 className="font-semibold text-blue-800 mb-2">💡 Tips</h4>
        <p className="text-blue-700 text-sm">{t.example}</p>
      </div>
    </div>
  );
};