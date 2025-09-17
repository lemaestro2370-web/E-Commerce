import React, { useState, useEffect } from 'react';
import { Gift, Star, Zap, Heart, Sparkles, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SurpriseModal({ isOpen, onClose }: SurpriseModalProps) {
  const { user, language } = useStore();
  const [currentSurprise, setCurrentSurprise] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const translations = {
    en: {
      welcome: 'Welcome Back!',
      dailyBonus: 'Daily Login Bonus',
      congratulations: 'Congratulations!',
      youEarned: 'You earned',
      points: 'points',
      loyaltyLevel: 'Loyalty Level',
      keepShopping: 'Keep shopping to unlock more rewards!',
      awesome: 'Awesome!',
      close: 'Continue Shopping',
      surprises: [
        {
          title: 'Daily Login Bonus!',
          description: 'Thanks for coming back! Here are your daily points.',
          points: 50,
          icon: 'star'
        },
        {
          title: 'Surprise Gift!',
          description: 'A special surprise just for you!',
          points: 100,
          icon: 'gift'
        },
        {
          title: 'Lightning Bonus!',
          description: 'You\'re on fire! Extra points for being awesome.',
          points: 75,
          icon: 'zap'
        }
      ]
    },
    fr: {
      welcome: 'Bon Retour!',
      dailyBonus: 'Bonus de Connexion Quotidien',
      congratulations: 'Félicitations!',
      youEarned: 'Vous avez gagné',
      points: 'points',
      loyaltyLevel: 'Niveau de Fidélité',
      keepShopping: 'Continuez vos achats pour débloquer plus de récompenses!',
      awesome: 'Fantastique!',
      close: 'Continuer les Achats',
      surprises: [
        {
          title: 'Bonus de Connexion Quotidien!',
          description: 'Merci d\'être revenu! Voici vos points quotidiens.',
          points: 50,
          icon: 'star'
        },
        {
          title: 'Cadeau Surprise!',
          description: 'Une surprise spéciale juste pour vous!',
          points: 100,
          icon: 'gift'
        },
        {
          title: 'Bonus Éclair!',
          description: 'Vous êtes en feu! Points supplémentaires pour être génial.',
          points: 75,
          icon: 'zap'
        }
      ]
    }
  };

  const t = translations[language];
  const surprise = t.surprises[currentSurprise];

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Randomly select a surprise
      setCurrentSurprise(Math.floor(Math.random() * t.surprises.length));
    }
  }, [isOpen, t.surprises.length]);

  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'star':
        return <Star className="w-12 h-12 text-yellow-400 fill-current" />;
      case 'gift':
        return <Gift className="w-12 h-12 text-purple-400" />;
      case 'zap':
        return <Zap className="w-12 h-12 text-blue-400" />;
      default:
        return <Heart className="w-12 h-12 text-red-400 fill-current" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        
        {/* Modal */}
        <div className={`
          relative bg-gradient-to-br from-green-400 via-green-500 to-green-600 rounded-2xl p-8 shadow-2xl max-w-md w-full text-white text-center
          transform transition-all duration-500 ease-out
          ${isAnimating ? 'scale-100 opacity-100' : 'scale-75 opacity-0'}
        `}>
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Floating sparkles */}
          <div className="absolute inset-0 overflow-hidden rounded-2xl">
            {[...Array(6)].map((_, i) => (
              <Sparkles
                key={i}
                className={`absolute w-4 h-4 text-yellow-300 animate-ping`}
                style={{
                  top: `${Math.random() * 80 + 10}%`,
                  left: `${Math.random() * 80 + 10}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          {/* Content */}
          <div className="relative z-10">
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-20 rounded-full mb-4 animate-bounce">
                {getIcon(surprise.icon)}
              </div>
              
              <h2 className="text-3xl font-bold mb-2">{t.congratulations}</h2>
              <h3 className="text-xl font-semibold mb-4">{surprise.title}</h3>
              <p className="text-lg opacity-90 mb-6">{surprise.description}</p>
            </div>

            {/* Points display */}
            <div className="bg-white bg-opacity-20 rounded-xl p-6 mb-6 backdrop-blur-sm">
              <div className="text-4xl font-bold mb-2">+{surprise.points}</div>
              <div className="text-lg">{t.points}</div>
            </div>

            {/* User info */}
            {user && (
              <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
                <div className="text-sm opacity-75 mb-1">{t.loyaltyLevel}</div>
                <div className="text-lg font-semibold">
                  {user.level || 'Bronze'} Member
                </div>
                <div className="text-sm opacity-75">
                  {user.loyalty_points || 0} total points
                </div>
              </div>
            )}

            <p className="text-sm opacity-75 mb-6">{t.keepShopping}</p>

            <Button
              onClick={onClose}
              className="bg-white text-green-600 hover:bg-gray-100 font-bold py-3 px-8 rounded-lg shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              {t.awesome}! {t.close}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}