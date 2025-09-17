import React, { useState } from 'react';
import { 
  AlertCircle, 
  RefreshCw, 
  LogIn, 
  Home, 
  CreditCard,
  CheckCircle,
  X
} from 'lucide-react';
import { Button } from './Button';
import { useSessionManager } from '../../hooks/useSessionManager';

interface PaymentErrorRecoveryProps {
  error: string;
  onRetry: () => void;
  onCancel: () => void;
  onLogin: () => void;
  onGoHome: () => void;
  className?: string;
}

export const PaymentErrorRecovery: React.FC<PaymentErrorRecoveryProps> = ({
  error,
  onRetry,
  onCancel,
  onLogin,
  onGoHome,
  className = ''
}) => {
  const { isSessionValid, refreshSession } = useSessionManager();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const isSessionError = error.toLowerCase().includes('session') || 
                        error.toLowerCase().includes('expired') ||
                        error.toLowerCase().includes('authenticated');

  const handleRefreshSession = async () => {
    setIsRefreshing(true);
    try {
      await refreshSession();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg border border-red-200 p-6 ${className}`}>
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Payment Error
          </h3>
          
          <p className="text-gray-700 mb-4">
            {error}
          </p>

          {isSessionError && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 text-sm">
                  This appears to be a session-related issue. Try refreshing your session first.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            {isSessionError && (
              <Button
                onClick={handleRefreshSession}
                loading={isRefreshing}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Session
              </Button>
            )}

            <Button
              onClick={handleRetry}
              loading={isRetrying}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            {!isSessionValid && (
              <Button
                onClick={onLogin}
                variant="ghost"
                className="text-blue-600 hover:bg-blue-50"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Login Again
              </Button>
            )}

            <Button
              onClick={onGoHome}
              variant="ghost"
              className="text-gray-600 hover:bg-gray-50"
            >
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>

            <Button
              onClick={onCancel}
              variant="ghost"
              className="text-red-600 hover:bg-red-50"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          </div>

          {/* Help Text */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Need help?</strong> If this problem persists, please contact our support team 
              or try refreshing your browser and logging in again.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
