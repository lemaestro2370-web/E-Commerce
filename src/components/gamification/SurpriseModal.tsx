import React from 'react';
import { Gift, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurpriseModal({ isOpen, onClose }: SurpriseModalProps) {
  const { language } = useStore();

  const translations = {
    en: {
      surprise: 'Surprise!',
      dailyBonus: 'Daily Login Bonus',
      message: 'Welcome back! You\'ve earned 50 loyalty points just for logging in today.',
      points: 'Points Earned',
      awesome: 'Awesome!',
      keepItUp: 'Keep logging in daily to earn more rewards!',
      close: 'Close'
    },
    fr: {
      surprise: 'Surprise!',
      dailyBonus: 'Bonus de Connexion Quotidien',
      message: 'Bon retour! Vous avez gagné 50 points de fidélité juste en vous connectant aujourd\'hui.',
      points: 'Points Gagnés',
      awesome: 'Fantastique!',
      keepItUp: 'Continuez à vous connecter quotidiennement pour gagner plus de récompenses!',
      close: 'Fermer'
    }
  };

  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100 opacity-50"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-bounce">
                <Gift className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{t.surprise}</h2>
            <h3 className="text-xl font-semibold text-blue-600">{t.dailyBonus}</h3>
          </div>

          {/* Content */}
          <div className="text-center mb-8">
            <p className="text-gray-700 mb-6">{t.message}</p>
            
            <div className="bg-gradient-to-r from-green-100 to-blue-100 rounded-lg p-6 mb-6">
              <div className="flex items-center justify-center space-x-3">
                <Sparkles className="w-6 h-6 text-yellow-500" />
                <div>
                  <p className="text-sm text-gray-600">{t.points}</p>
                  <p className="text-3xl font-bold text-green-600">+50</p>
                </div>
                <Sparkles className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
            
            <p className="text-sm text-gray-600">{t.keepItUp}</p>
          </div>

          {/* Actions */}
          <div className="text-center">
            <Button
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white px-8 py-3 rounded-xl font-semibold"
            >
              {t.awesome}!
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}