import React, { useState, useEffect } from 'react';
import { Gift, RotateCcw, Star, Trophy, Heart, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';

interface SpinningWheelProps {
  onClose?: () => void;
}

interface Prize {
  id: string;
  name: string;
  name_fr: string;
  type: 'discount' | 'points' | 'gift' | 'nothing';
  value: number;
  probability: number; // 0-100
  color: string;
  icon: React.ReactNode;
}

const prizes: Prize[] = [
  {
    id: 'discount_10',
    name: '10% Discount',
    name_fr: '10% de réduction',
    type: 'discount',
    value: 10,
    probability: 20,
    color: 'from-green-400 to-green-600',
    icon: <Star className="w-6 h-6" />
  },
  {
    id: 'discount_20',
    name: '20% Discount',
    name_fr: '20% de réduction',
    type: 'discount',
    value: 20,
    probability: 15,
    color: 'from-blue-400 to-blue-600',
    icon: <Trophy className="w-6 h-6" />
  },
  {
    id: 'points_100',
    name: '100 Points',
    name_fr: '100 points',
    type: 'points',
    value: 100,
    probability: 25,
    color: 'from-purple-400 to-purple-600',
    icon: <Heart className="w-6 h-6" />
  },
  {
    id: 'points_200',
    name: '200 Points',
    name_fr: '200 points',
    type: 'points',
    value: 200,
    probability: 15,
    color: 'from-pink-400 to-pink-600',
    icon: <Zap className="w-6 h-6" />
  },
  {
    id: 'gift',
    name: 'Free Gift',
    name_fr: 'Cadeau gratuit',
    type: 'gift',
    value: 1,
    probability: 5,
    color: 'from-yellow-400 to-yellow-600',
    icon: <Gift className="w-6 h-6" />
  },
  {
    id: 'nothing',
    name: 'Try Again',
    name_fr: 'Réessayer',
    type: 'nothing',
    value: 0,
    probability: 20,
    color: 'from-gray-400 to-gray-600',
    icon: <RotateCcw className="w-6 h-6" />
  }
];

export const SpinningWheel: React.FC<SpinningWheelProps> = ({ onClose }) => {
  const { user, language } = useStore();
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpunToday, setHasSpunToday] = useState(false);
  const [lastSpinDate, setLastSpinDate] = useState<string | null>(null);
  const [wonPrize, setWonPrize] = useState<Prize | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [rotation, setRotation] = useState(0);

  const t = {
    en: {
      title: 'Daily Spin',
      subtitle: 'Spin the wheel to win amazing prizes!',
      spinButton: 'Spin Now',
      alreadySpun: 'You already spun today!',
      comeBackTomorrow: 'Come back tomorrow for another chance!',
      congratulations: 'Congratulations!',
      youWon: 'You won:',
      discount: 'Discount',
      points: 'Points',
      freeGift: 'Free Gift',
      tryAgain: 'Try Again',
      close: 'Close',
      spinAgain: 'Spin Again'
    },
    fr: {
      title: 'Tour Quotidien',
      subtitle: 'Tournez la roue pour gagner des prix incroyables!',
      spinButton: 'Tourner Maintenant',
      alreadySpun: 'Vous avez déjà tourné aujourd\'hui!',
      comeBackTomorrow: 'Revenez demain pour une autre chance!',
      congratulations: 'Félicitations!',
      youWon: 'Vous avez gagné:',
      discount: 'Réduction',
      points: 'Points',
      freeGift: 'Cadeau Gratuit',
      tryAgain: 'Réessayer',
      close: 'Fermer',
      spinAgain: 'Tourner Encore'
    }
  };

  const currentT = t[language];

  // Check if user has spun today
  useEffect(() => {
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('lastSpinDate');
    
    if (storedDate === today) {
      setHasSpunToday(true);
      setLastSpinDate(storedDate);
    } else {
      setHasSpunToday(false);
    }
  }, []);

  const selectRandomPrize = (): Prize => {
    const random = Math.random() * 100;
    let cumulativeProbability = 0;
    
    for (const prize of prizes) {
      cumulativeProbability += prize.probability;
      if (random <= cumulativeProbability) {
        return prize;
      }
    }
    
    // Fallback to last prize if something goes wrong
    return prizes[prizes.length - 1];
  };

  const handleSpin = () => {
    if (hasSpunToday || isSpinning) return;

    setIsSpinning(true);
    setWonPrize(null);
    setShowResult(false);

    // Select winning prize
    const selectedPrize = selectRandomPrize();
    
    // Calculate rotation (multiple full rotations + prize position)
    const prizeIndex = prizes.findIndex(p => p.id === selectedPrize.id);
    const prizeAngle = (360 / prizes.length) * prizeIndex;
    const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const finalRotation = fullRotations * 360 + (360 - prizeAngle);
    
    setRotation(prev => prev + finalRotation);

    // Show result after animation
    setTimeout(() => {
      setWonPrize(selectedPrize);
      setShowResult(true);
      setIsSpinning(false);
      
      // Mark as spun today
      const today = new Date().toDateString();
      localStorage.setItem('lastSpinDate', today);
      setHasSpunToday(true);
      setLastSpinDate(today);
    }, 3000);
  };

  const handleClose = () => {
    setShowResult(false);
    setWonPrize(null);
    if (onClose) onClose();
  };


  const handleSpinAgain = () => {
    setShowResult(false);
    setWonPrize(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 opacity-50"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{currentT.title}</h2>
            <p className="text-gray-600">{currentT.subtitle}</p>
          </div>

          {/* Wheel */}
          <div className="relative mb-8">
            <div className="w-64 h-64 mx-auto relative">
              {/* Wheel */}
              <div 
                className="w-full h-full rounded-full border-8 border-gray-200 relative overflow-hidden transition-transform duration-3000 ease-out"
                style={{ transform: `rotate(${rotation}deg)` }}
              >
                {prizes.map((prize, index) => {
                  const angle = (360 / prizes.length) * index;
                  const nextAngle = (360 / prizes.length) * (index + 1);
                  const midAngle = angle + (nextAngle - angle) / 2;
                  
                  return (
                    <div
                      key={prize.id}
                      className="absolute inset-0"
                      style={{
                        transform: `rotate(${angle}deg)`,
                        transformOrigin: 'center'
                      }}
                    >
                      <div
                        className={`w-full h-full bg-gradient-to-r ${prize.color} flex items-center justify-center`}
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((nextAngle - angle) * Math.PI / 180)}% ${50 - 50 * Math.sin((nextAngle - angle) * Math.PI / 180)}%)`
                        }}
                      >
                        <div 
                          className="text-white text-center transform -rotate-90 origin-center"
                          style={{ transform: `rotate(${midAngle}deg)` }}
                        >
                          <div className="flex flex-col items-center">
                            {prize.icon}
                            <span className="text-xs font-semibold mt-1">
                              {language === 'en' ? prize.name : prize.name_fr}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-8 border-l-transparent border-r-transparent border-b-red-500"></div>
              </div>
            </div>
          </div>

          {/* Status */}
          {hasSpunToday && !showResult && (
            <div className="text-center mb-6">
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-800 font-semibold">{currentT.alreadySpun}</p>
                <p className="text-yellow-600 text-sm mt-1">{currentT.comeBackTomorrow}</p>
              </div>
            </div>
          )}

          {/* Result */}
          {showResult && wonPrize && (
            <div className="text-center mb-6">
              <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{currentT.congratulations}</h3>
                <p className="text-gray-700 mb-4">{currentT.youWon}</p>
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className={`p-3 rounded-full bg-gradient-to-r ${wonPrize.color}`}>
                    {wonPrize.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-gray-900">
                      {language === 'en' ? wonPrize.name : wonPrize.name_fr}
                    </p>
                    {wonPrize.type !== 'nothing' && (
                      <p className="text-gray-600">
                        {wonPrize.type === 'discount' && `${wonPrize.value}% ${currentT.discount}`}
                        {wonPrize.type === 'points' && `${wonPrize.value} ${currentT.points}`}
                        {wonPrize.type === 'gift' && currentT.freeGift}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            <Button
              onClick={handleClose}
              variant="ghost"
              className="flex-1"
            >
              {currentT.close}
            </Button>
            
            {showResult ? (
              <Button
                onClick={handleSpinAgain}
                variant="ghost"
                className="flex-1"
              >
                {currentT.spinAgain}
              </Button>
            ) : (
              <Button
                onClick={handleSpin}
                disabled={hasSpunToday || isSpinning}
                className={`flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 ${
                  isSpinning ? 'animate-pulse' : ''
                }`}
              >
                {isSpinning ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                    <span>Spinning...</span>
                  </div>
                ) : (
                  currentT.spinButton
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
