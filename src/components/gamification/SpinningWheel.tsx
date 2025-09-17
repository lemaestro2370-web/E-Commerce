import React, { useState, useEffect } from 'react';
import { Gift, RotateCcw, Star, Trophy, Heart, Zap, Crown, Sparkles } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/supabase';

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
  const { user, language, addReward, setUser } = useStore();
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
    setTimeout(async () => {
      setWonPrize(selectedPrize);
      setShowResult(true);
      setIsSpinning(false);
      
      // Add reward to user's account
      if (selectedPrize.type !== 'nothing' && user) {
        // Map prize type to allowed UserReward.type
        let rewardType: "daily_login" | "first_purchase" | "loyalty_points" | "surprise_gift" | "achievement";
        if (selectedPrize.type === "points") {
          rewardType = "loyalty_points";
        } else if (selectedPrize.type === "discount" || selectedPrize.type === "gift") {
          rewardType = "surprise_gift";
        } else {
          rewardType = "achievement"; // fallback, not used for 'nothing'
        }

        const reward = {
          id: crypto.randomUUID(),
          user_id: user.id,
          type: rewardType,
          title: `Spin Wheel: ${language === 'en' ? selectedPrize.name : selectedPrize.name_fr}`,
          description: `You won ${selectedPrize.value} ${selectedPrize.type} from the daily spin wheel!`,
          points: selectedPrize.type === 'points' ? selectedPrize.value : 0,
          claimed: false,
          created_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };

        addReward(reward);
        
        // Update user's loyalty points if it's a points reward
        if (selectedPrize.type === 'points' && user) {
          const updatedUser = {
            ...user,
            loyalty_points: (user.loyalty_points || 0) + selectedPrize.value
          };
          setUser(updatedUser);
        }
        
        // Try to save to database
        try {
          await db.createReward(reward);
          
          // Update user points in database
          if (selectedPrize.type === 'points') {
            await db.updateProfile(user.id, {
              loyalty_points: (user.loyalty_points || 0) + selectedPrize.value
            });
          }
        } catch (error) {
          console.warn('Could not save reward to database:', error);
        }
      }
      
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
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-100 via-pink-100 to-yellow-100 opacity-60"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
        
        <div className="relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg animate-bounce">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
              {currentT.title}
            </h2>
            <p className="text-lg text-gray-700 font-medium">{currentT.subtitle}</p>
          </div>

          {/* Wheel */}
          <div className="relative mb-8">
            <div className="w-96 h-96 mx-auto relative">
              {/* Wheel */}
              <div 
                className="w-full h-full rounded-full border-8 border-yellow-400 relative overflow-hidden shadow-2xl transition-transform duration-3000 ease-out"
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 3s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none'
                }}
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
                        transform: `rotate(${angle}deg)`
                      }}
                    >
                      <div
                        className={`absolute inset-0 bg-gradient-to-r ${prize.color}`}
                        style={{
                          clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((360 / prizes.length) * Math.PI / 180)}% ${50 - 50 * Math.sin((360 / prizes.length) * Math.PI / 180)}%)`
                        }}
                      >
                        <div
                          className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            transform: `rotate(${(360 / prizes.length) / 2}deg)`,
                            transformOrigin: '50% 50%'
                          }}
                        >
                          <div className="text-center">
                            {prize.icon}
                            <div className="text-xs mt-1">
                              {language === 'en' ? prize.name : prize.name_fr}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {/* Pointer */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-10">
                <div className="w-0 h-0 border-l-6 border-r-6 border-b-12 border-l-transparent border-r-transparent border-b-red-600 drop-shadow-lg"></div>
              </div>
              
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full border-4 border-white shadow-2xl flex items-center justify-center z-10">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
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
              <div className="p-8 bg-gradient-to-r from-green-50 via-blue-50 to-purple-50 border-2 border-green-300 rounded-2xl shadow-inner">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-3">
                  {currentT.congratulations}
                </h3>
                <p className="text-lg text-gray-700 mb-6 font-medium">{currentT.youWon}</p>
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <div className={`p-4 rounded-full bg-gradient-to-r ${wonPrize.color} shadow-lg animate-pulse`}>
                    {wonPrize.icon}
                  </div>
                  <div className="text-left">
                    <p className="text-2xl font-bold text-gray-900">
                      {language === 'en' ? wonPrize.name : wonPrize.name_fr}
                    </p>
                    {wonPrize.type !== 'nothing' && (
                      <p className="text-lg text-gray-600 font-medium">
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
              className="flex-1 border-2 border-gray-300 hover:border-gray-400 font-semibold"
            >
              {currentT.close}
            </Button>
            
            {showResult ? (
              <Button
                onClick={handleSpinAgain}
                variant="ghost"
                className="flex-1 border-2 border-purple-300 hover:border-purple-400 text-purple-600 font-semibold"
              >
                {currentT.spinAgain}
              </Button>
            ) : (
              <Button
                onClick={handleSpin}
                disabled={hasSpunToday || isSpinning}
                className={`flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 ${
                  isSpinning ? 'animate-pulse' : ''
                }`}
              >
                {isSpinning ? (
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    <span className="text-lg">Spinning...</span>
                  </div>
                ) : (
                  <span className="text-lg">{currentT.spinButton}</span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};