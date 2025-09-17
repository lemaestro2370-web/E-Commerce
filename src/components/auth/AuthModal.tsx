import { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useStore } from '../../store/useStore';

interface AuthModalProps {
  onClose: () => void;
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const { language, colorTheme, setUser } = useStore();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const translations = {
    en: {
      login: 'Login',
      signup: 'Sign Up',
      fullName: 'Full Name',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      loginAction: 'Sign In',
      signupAction: 'Create Account',
      switchToSignup: "Don't have an account? Sign up",
      switchToLogin: 'Already have an account? Login',
      demoCredentials: 'Demo Credentials',
      adminDemo: 'Admin: admin@demo.com / admin123',
      userDemo: 'User: user@demo.com / user123',
      passwordMismatch: 'Passwords do not match',
      weakPassword: 'Password must be at least 6 characters',
      invalidEmail: 'Please enter a valid email address',
      welcome: 'Welcome Back!',
      createAccount: 'Create Your Account',
      loginSubtitle: 'Sign in to access your account',
      signupSubtitle: 'Join our community today',
      loginSuccess: 'Login successful! Welcome back.',
      signupSuccess: 'Account created successfully! You are now logged in.',
      tryDemo: 'Try Demo Account',
    },
    fr: {
      login: 'Connexion',
      signup: 'Inscription',
      fullName: 'Nom Complet',
      email: 'E-mail',
      password: 'Mot de passe',
      confirmPassword: 'Confirmer le Mot de Passe',
      loginAction: 'Se connecter',
      signupAction: 'Créer un compte',
      switchToSignup: "Pas de compte ? S'inscrire",
      switchToLogin: 'Déjà un compte ? Se connecter',
      demoCredentials: 'Identifiants de démonstration',
      adminDemo: 'Admin: admin@demo.com / admin123',
      userDemo: 'Utilisateur: user@demo.com / user123',
      passwordMismatch: 'Les mots de passe ne correspondent pas',
      weakPassword: 'Le mot de passe doit contenir au moins 6 caractères',
      invalidEmail: 'Veuillez saisir une adresse e-mail valide',
      welcome: 'Bon Retour!',
      createAccount: 'Créez Votre Compte',
      loginSubtitle: 'Connectez-vous pour accéder à votre compte',
      signupSubtitle: 'Rejoignez notre communauté aujourd\'hui',
      loginSuccess: 'Connexion réussie! Bon retour.',
      signupSuccess: 'Compte créé avec succès! Vous êtes maintenant connecté.',
      tryDemo: 'Essayer Compte Démo',
    }
  };

  const t = translations[language];
  
  const getThemeColors = () => {
    const themes = {
      blue: { primary: 'bg-blue-600', secondary: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-500' },
      green: { primary: 'bg-green-600', secondary: 'bg-green-50', text: 'text-green-600', border: 'border-green-500' },
      purple: { primary: 'bg-purple-600', secondary: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-500' },
      orange: { primary: 'bg-orange-600', secondary: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-500' },
      red: { primary: 'bg-red-600', secondary: 'bg-red-50', text: 'text-red-600', border: 'border-red-500' },
    };
    return themes[colorTheme];
  };
  
  const themeColors = getThemeColors();
  
  const validateForm = () => {
    if (!email.includes('@')) {
      setError(t.invalidEmail);
      return false;
    }
    
    if (password.length < 6) {
      setError(t.weakPassword);
      return false;
    }
    
    if (!isLogin && password !== confirmPassword) {
      setError(t.passwordMismatch);
      return false;
    }
    
    return true;
  };

  const simulateAuth = async (email: string, password: string, isSignup: boolean = false) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Demo accounts
    const demoAccounts = {
      'admin@demo.com': { password: 'admin123', isAdmin: true },
      'user@demo.com': { password: 'user123', isAdmin: false }
    };
    
    const account = demoAccounts[email as keyof typeof demoAccounts];
    
    if (isSignup) {
      // For signup, create new user
      const userId = crypto.randomUUID();
      return {
        user: {
          id: userId,
          email: email,
          full_name: fullName,
          is_admin: false,
          created_at: new Date().toISOString()
        }
      };
    } else {
      // For login, check demo accounts
      if (account && account.password === password) {
        const userId = email === 'admin@demo.com' ? 'admin-demo-uuid' : 'user-demo-uuid';
        return {
          user: {
            id: userId,
            email: email,
            is_admin: account.isAdmin,
            created_at: new Date().toISOString()
          }
        };
      } else {
        throw new Error('Invalid email or password');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await simulateAuth(email, password, !isLogin);
      
      if (result.user) {
        setUser(result.user);
        setSuccess(isLogin ? t.loginSuccess : t.signupSuccess);
        
        // Close modal after success
        setTimeout(() => {
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@demo.com');
      setPassword('admin123');
    } else {
      setEmail('user@demo.com');
      setPassword('user123');
    }
    setError('');
    setSuccess('');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 ${themeColors.primary} rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse`}>
          <UserIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">
          {isLogin ? t.welcome : t.createAccount}
        </h2>
        <p className="text-gray-600 mt-2">
          {isLogin ? t.loginSubtitle : t.signupSubtitle}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name (Signup only) */}
        {!isLogin && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              {t.fullName}
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${themeColors.border} transition-all`}
                placeholder="John Doe"
                required={!isLogin}
              />
            </div>
          </div>
        )}
        
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            {t.email}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${themeColors.border} transition-all`}
              placeholder="your@email.com"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            {t.password}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${themeColors.border} transition-all`}
              placeholder="••••••••"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>
        
        {/* Confirm Password (Signup only) */}
        {!isLogin && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              {t.confirmPassword}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 ${themeColors.border} transition-all`}
                placeholder="••••••••"
                required={!isLogin}
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="w-4 h-4 flex-shrink-0 rounded-full bg-green-500 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
            <span>{success}</span>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={loading}
          className="w-full"
        >
          {isLogin ? t.loginAction : t.signupAction}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
              setSuccess('');
            }}
            className={`${themeColors.text} hover:underline text-sm font-medium transition-all`}
          >
            {isLogin ? t.switchToSignup : t.switchToLogin}
          </button>
        </div>

        {/* Demo credentials */}
        <div className={`mt-6 p-4 ${themeColors.secondary} rounded-lg border ${themeColors.border}`}>
          <h4 className={`text-sm font-semibold ${themeColors.text} mb-3 text-center`}>
            {t.tryDemo}
          </h4>
          <div className="space-y-2">
            <button
              type="button"
              className={`w-full text-left cursor-pointer hover:bg-white p-3 rounded transition-colors text-sm ${themeColors.text} border border-transparent hover:border-gray-200`}
              onClick={() => fillDemoCredentials('admin')}
            >
              <div className="font-medium">👨‍💼 Admin Account</div>
              <div className="text-xs opacity-75">{t.adminDemo}</div>
            </button>
            <button
              type="button"
              className={`w-full text-left cursor-pointer hover:bg-white p-3 rounded transition-colors text-sm ${themeColors.text} border border-transparent hover:border-gray-200`}
              onClick={() => fillDemoCredentials('user')}
            >
              <div className="font-medium">👤 User Account</div>
              <div className="text-xs opacity-75">{t.userDemo}</div>
            </button>
          </div>
          <p className={`text-xs ${themeColors.text} mt-3 opacity-75 text-center`}>
            Click any demo account to auto-fill credentials
          </p>
        </div>
      </form>
    </div>
  );
}