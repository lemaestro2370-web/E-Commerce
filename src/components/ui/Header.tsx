import { ShoppingCart, User, Globe, Box, Gift, Star } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { Button } from './Button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onCartClick: () => void;
  onAuthClick: () => void;
}

export function Header({ onCartClick, onAuthClick }: HeaderProps) {
  const { 
    language, 
    setLanguage, 
    colorTheme,
    isAuthenticated, 
    getCartItemCount,
    user,
    getUnclaimedRewards,
    getLoyaltyLevel
  } = useStore();
  
  const navigate = useNavigate();

  const translations = {
    en: {
      title: 'CameroonMart',
      home: 'Home',
      shop: 'Shop',
      myOrders: 'My Orders',
      cart: 'Cart',
      login: 'Login',
      logout: 'Logout',
      admin: 'Admin',
      profile: 'Profile',
      rewards: 'Rewards',
    },
    fr: {
      title: 'CameroonMart',
      home: 'Accueil',
      shop: 'Boutique',
      myOrders: 'Mes Commandes',
      cart: 'Panier',
      login: 'Connexion',
      logout: 'Déconnexion',
      admin: 'Admin',
      profile: 'Profil',
      rewards: 'Récompenses',
    }
  };

  const t = translations[language];
  const cartCount = getCartItemCount();
  const unclaimedRewards = getUnclaimedRewards();
  
  // Dynamic color classes based on theme
  const getThemeColors = () => {
    const themes = {
      blue: 'bg-blue-600 border-blue-200',
      green: 'bg-green-600 border-green-200',
      purple: 'bg-purple-600 border-purple-200',
      orange: 'bg-orange-600 border-orange-200',
      red: 'bg-red-600 border-red-200',
    };
    return themes[colorTheme];
  };

  return (
    <header className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="p-2 rounded-lg bg-green-600">
              <Box className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              {t.title}
            </h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              {t.home}
            </button>
            <button
              onClick={() => navigate('/shop')}
              className="text-gray-700 hover:text-green-600 font-medium transition-colors"
            >
              {t.shop}
            </button>
            {isAuthenticated() && (
              <button
                onClick={() => navigate('/orders')}
                className="text-gray-700 hover:text-green-600 font-medium transition-colors"
              >
                {t.myOrders}
              </button>
            )}
          </nav>
          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Rewards (for authenticated users) */}
            {isAuthenticated() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/profile')}
                className="flex items-center space-x-1 relative"
              >
                <Gift className="w-4 h-4" />
                <span className="hidden sm:inline">{t.rewards}</span>
                {unclaimedRewards.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unclaimedRewards.length}
                  </span>
                )}
              </Button>
            )}


            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'fr' : 'en')}
              className="flex items-center space-x-1"
            >
              <Globe className="w-4 h-4" />
              <span className="font-semibold">{language.toUpperCase()}</span>
            </Button>

            {/* User Level (for authenticated users) */}
            {isAuthenticated() && user && (
              <div className="hidden sm:flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">{getLoyaltyLevel()}</span>
              </div>
            )}



            {/* Cart Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onCartClick}
              className="flex items-center space-x-1 relative"
              data-cart-button
            >
              <ShoppingCart className="w-5 h-5" />
              <span className="hidden sm:inline">{t.cart}</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Button>

            {/* Auth Button */}
            <Button
              variant="primary"
              size="sm"
              onClick={isAuthenticated() ? onAuthClick : onAuthClick}
              className="flex items-center space-x-1"
            >
              <User className="w-4 h-4" />
              <span>{isAuthenticated() ? t.logout : t.login}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}