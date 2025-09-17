import { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Smartphone, 
  Truck, 
  Shield, 
  CheckCircle, 
  Loader2,
  ArrowLeft,
  ArrowRight,
  Lock,
  Clock,
  MapPin,
  User,
  Phone
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { db } from '../../lib/supabase';
import { Button } from '../ui/Button';
import { PaymentErrorRecovery } from '../ui/PaymentErrorRecovery';
import { CODProcessor, MobileMoneyProcessor } from '../../utils/payments';

interface EnhancedCheckoutFormProps {
  onSuccess: () => void;
  onBack: () => void;
}

export function EnhancedCheckoutForm({ onSuccess, onBack }: EnhancedCheckoutFormProps) {
  const { user, cart, language, getCartTotal, clearCart } = useStore();
  
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'info' | 'payment' | 'processing' | 'success'>('info');
  
  // Form data
  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    notes: ''
  });
  
  const [paymentInfo, setPaymentInfo] = useState({
    method: 'cod',
    phone: ''
  });

  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(7);
  const [showErrorRecovery, setShowErrorRecovery] = useState(false);

  const translations = {
    en: {
      backToCart: 'Back to Cart',
      shippingInfo: 'Shipping Information',
      fullName: 'Full Name',
      phone: 'Phone Number',
      address: 'Delivery Address',
      notes: 'Special Instructions (Optional)',
      paymentMethod: 'Payment Method',
      paymentPhone: 'Mobile Money Phone Number',
      placeOrder: 'Place Order',
      processing: 'Processing Payment...',
      orderTotal: 'Order Total',
      phoneRequired: 'Phone number is required',
      addressRequired: 'Delivery address is required',
      nameRequired: 'Full name is required',
      invalidPhone: 'Please enter a valid phone number',
      paymentFailed: 'Payment failed. Please try again.',
      orderSuccess: 'Order placed successfully!',
      next: 'Continue',
      orderSummary: 'Order Summary',
      items: 'items',
      redirecting: 'Redirecting in',
      seconds: 'seconds...',
      tryAgain: 'Try Again',
      orderCreated: 'Your order has been created successfully!',
      thankYou: 'Thank you for your purchase!',
      securePayment: 'Secure Payment',
      securePaymentDesc: 'Your payment information is encrypted and secure',
      fastDelivery: 'Fast Delivery',
      fastDeliveryDesc: 'Get your order delivered within 24-48 hours',
      customerSupport: '24/7 Support',
      customerSupportDesc: 'We\'re here to help if you need assistance',
      paymentMethods: {
        cod: 'Cash on Delivery',
        momo: 'MTN Mobile Money',
        orange: 'Orange Money'
      },
      paymentMethodDesc: {
        cod: 'Pay when your order arrives',
        momo: 'Pay with your MTN Mobile Money account',
        orange: 'Pay with your Orange Money account'
      },
      stepIndicator: {
        info: 'Shipping Info',
        payment: 'Payment',
        processing: 'Processing',
        success: 'Complete'
      }
    },
    fr: {
      backToCart: 'Retour au panier',
      shippingInfo: 'Informations de livraison',
      fullName: 'Nom complet',
      phone: 'Numéro de téléphone',
      address: 'Adresse de livraison',
      notes: 'Instructions spéciales (Optionnel)',
      paymentMethod: 'Méthode de paiement',
      paymentPhone: 'Numéro de téléphone Mobile Money',
      placeOrder: 'Passer la commande',
      processing: 'Traitement du paiement...',
      orderTotal: 'Total de la commande',
      phoneRequired: 'Le numéro de téléphone est requis',
      addressRequired: 'L\'adresse de livraison est requise',
      nameRequired: 'Le nom complet est requis',
      invalidPhone: 'Veuillez entrer un numéro de téléphone valide',
      paymentFailed: 'Le paiement a échoué. Veuillez réessayer.',
      orderSuccess: 'Commande passée avec succès!',
      next: 'Continuer',
      orderSummary: 'Résumé de la commande',
      items: 'articles',
      redirecting: 'Redirection dans',
      seconds: 'secondes...',
      tryAgain: 'Réessayer',
      orderCreated: 'Votre commande a été créée avec succès!',
      thankYou: 'Merci pour votre achat!',
      securePayment: 'Paiement sécurisé',
      securePaymentDesc: 'Vos informations de paiement sont chiffrées et sécurisées',
      fastDelivery: 'Livraison rapide',
      fastDeliveryDesc: 'Recevez votre commande en 24-48 heures',
      customerSupport: 'Support 24/7',
      customerSupportDesc: 'Nous sommes là pour vous aider si vous avez besoin d\'assistance',
      paymentMethods: {
        cod: 'Paiement à la livraison',
        momo: 'MTN Mobile Money',
        orange: 'Orange Money'
      },
      paymentMethodDesc: {
        cod: 'Payez quand votre commande arrive',
        momo: 'Payez avec votre compte MTN Mobile Money',
        orange: 'Payez avec votre compte Orange Money'
      },
      stepIndicator: {
        info: 'Info livraison',
        payment: 'Paiement',
        processing: 'Traitement',
        success: 'Terminé'
      }
    }
  };

  const t = translations[language];


  const validateShippingInfo = () => {
    setError('');
    
    if (!shippingInfo.fullName.trim()) {
      setError(t.nameRequired);
      return false;
    }
    if (!shippingInfo.phone.trim()) {
      setError(t.phoneRequired);
      return false;
    }
    if (!shippingInfo.address.trim()) {
      setError(t.addressRequired);
      return false;
    }
    if (!shippingInfo.phone.match(/^(237)?[0-9]{8,9}$/)) {
      setError(t.invalidPhone);
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Ensure user is authenticated
      if (!user) {
        throw new Error('User not authenticated. Please log in to continue.');
      }

      const total = getCartTotal();
      let result;
      
      if (paymentInfo.method === 'cod') {
        result = await CODProcessor.processCODOrder();
      } else if (paymentInfo.method === 'momo') {
        result = await MobileMoneyProcessor.processMTNPayment(
          total,
          paymentInfo.phone || shippingInfo.phone
        );
      } else if (paymentInfo.method === 'orange') {
        result = await MobileMoneyProcessor.processOrangePayment(
          total,
          paymentInfo.phone || shippingInfo.phone
        );
      }
      
      // Process the result immediately
      if (result?.success || paymentInfo.method === 'cod') {
        await createOrder(result);
      } else {
        setError(result && 'error' in result && result.error ? result.error : t.paymentFailed);
        setLoading(false);
        setCurrentStep('payment');
      }
    } catch (error: any) {
      console.error('Payment processing error:', error);
      setError(error.message || t.paymentFailed);
      setLoading(false);
      setCurrentStep('payment');
      setShowErrorRecovery(true);
    }
  };

  const createOrder = async (paymentResult: any) => {
    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const orderData = {
        user_id: user.id,
        items: cart.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        total_amount: getCartTotal(),
        shipping_info: shippingInfo,
        payment_method: paymentInfo.method,
        payment_status: paymentInfo.method === 'cod' ? 'pending' : 'completed',
        status: 'processing',
        payment_reference: paymentResult?.transactionId || paymentResult?.orderId || null
      };

      const { data, error } = await db.createOrder(orderData);
      
      if (error) {
        throw new Error(error.message || 'Failed to create order');
      }

      if (data) {
        clearCart();
        setCurrentStep('success');
      }
    } catch (error: any) {
      console.error('Order creation error:', error);
      setError(error.message || 'Failed to create order');
      setLoading(false);
      setCurrentStep('payment');
    }
  };

  const handleSuccessComplete = () => {
    onSuccess();
  };

  // Auto close after countdown
  useEffect(() => {
    if (currentStep === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (currentStep === 'success' && countdown === 0) {
      handleSuccessComplete();
    }
  }, [currentStep, countdown]);

  // Step indicator
  const steps = ['info', 'payment', 'processing', 'success'];
  const currentStepIndex = steps.indexOf(currentStep);


  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Step Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${index <= currentStepIndex 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
                }
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStepIndex ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {t.stepIndicator[step as keyof typeof t.stepIndicator]}
              </span>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-4 ${
                  index < currentStepIndex ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Success Step */}
      {currentStep === 'success' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.orderSuccess}</h3>
          <p className="text-gray-600 mb-6">{t.thankYou}</p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800">
              {t.redirecting} {countdown} {t.seconds}
            </p>
          </div>
          <Button onClick={handleSuccessComplete} className="bg-blue-600 hover:bg-blue-700 text-white">
            Continue Shopping
          </Button>
        </div>
      )}

      {/* Processing Step */}
      {currentStep === 'processing' && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">{t.processing}</h3>
          <p className="text-gray-600">Please wait while we process your payment...</p>
        </div>
      )}

      {/* Info Step */}
      {currentStep === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shipping Information Form */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <MapPin className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t.shippingInfo}</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  {t.fullName}
                </label>
                <input
                  type="text"
                  value={shippingInfo.fullName}
                  onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your full name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  {t.phone}
                </label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  {t.address}
                </label>
                <textarea
                  value={shippingInfo.address}
                  onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your delivery address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.notes}
                </label>
                <textarea
                  value={shippingInfo.notes}
                  onChange={(e) => setShippingInfo({...shippingInfo, notes: e.target.value})}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any special instructions for delivery"
                />
              </div>
            </div>
            
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}
            
            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={onBack}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t.backToCart}
              </Button>
              <Button
                onClick={() => {
                  if (validateShippingInfo()) {
                    setCurrentStep('payment');
                  }
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center"
              >
                {t.next}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.orderSummary}</h3>
            
            <div className="space-y-3 mb-6">
              {cart.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-900">
                    {(item.price * item.quantity).toLocaleString()} FCFA
                  </p>
                </div>
              ))}
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">{t.orderTotal}</span>
                <span className="text-xl font-bold text-blue-600">
                  {getCartTotal().toLocaleString()} FCFA
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Step */}
      {currentStep === 'payment' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Payment Methods */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center mb-6">
              <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">{t.paymentMethod}</h2>
            </div>
            
            <div className="space-y-4">
              {/* Cash on Delivery */}
              <div
                onClick={() => setPaymentInfo({...paymentInfo, method: 'cod'})}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentInfo.method === 'cod' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Truck className="w-6 h-6 text-green-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.paymentMethods.cod}</h3>
                    <p className="text-sm text-gray-600">{t.paymentMethodDesc.cod}</p>
                  </div>
                </div>
              </div>

              {/* MTN Mobile Money */}
              <div
                onClick={() => setPaymentInfo({...paymentInfo, method: 'momo'})}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentInfo.method === 'momo' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Smartphone className="w-6 h-6 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.paymentMethods.momo}</h3>
                    <p className="text-sm text-gray-600">{t.paymentMethodDesc.momo}</p>
                  </div>
                </div>
              </div>

              {/* Orange Money */}
              <div
                onClick={() => setPaymentInfo({...paymentInfo, method: 'orange'})}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  paymentInfo.method === 'orange' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <Smartphone className="w-6 h-6 text-orange-600 mr-3" />
                  <div>
                    <h3 className="font-semibold text-gray-900">{t.paymentMethods.orange}</h3>
                    <p className="text-sm text-gray-600">{t.paymentMethodDesc.orange}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile Money Phone Input */}
            {(paymentInfo.method === 'momo' || paymentInfo.method === 'orange') && (
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.paymentPhone}
                </label>
                <input
                  type="tel"
                  value={paymentInfo.phone}
                  onChange={(e) => setPaymentInfo({...paymentInfo, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your mobile money phone number"
                />
              </div>
            )}

            {error && showErrorRecovery && (
              <div className="mt-4">
                <PaymentErrorRecovery
                  error={error}
                  onRetry={() => {
                    setShowErrorRecovery(false);
                    setError('');
                    processPayment();
                  }}
                  onCancel={() => {
                    setShowErrorRecovery(false);
                    setError('');
                    onBack();
                  }}
                  onLogin={() => {
                    setShowErrorRecovery(false);
                    setError('');
                    // This would trigger login modal
                    window.location.reload();
                  }}
                  onGoHome={() => {
                    setShowErrorRecovery(false);
                    setError('');
                    window.location.href = '/';
                  }}
                />
              </div>
            )}

            {error && !showErrorRecovery && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{error}</p>
                <Button
                  onClick={() => setShowErrorRecovery(true)}
                  variant="ghost"
                  size="sm"
                  className="mt-2 text-red-600 hover:bg-red-100"
                >
                  Get Help
                </Button>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button
                variant="ghost"
                onClick={() => setCurrentStep('info')}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={processPayment}
                loading={loading}
                className="bg-green-600 hover:bg-green-700 text-white flex items-center"
              >
                <Lock className="w-4 h-4 mr-2" />
                {t.placeOrder}
              </Button>
            </div>
          </div>

          {/* Security Features */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Shield className="w-6 h-6 text-green-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">{t.securePayment}</h3>
              </div>
              <p className="text-gray-600">{t.securePaymentDesc}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Truck className="w-6 h-6 text-blue-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">{t.fastDelivery}</h3>
              </div>
              <p className="text-gray-600">{t.fastDeliveryDesc}</p>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center mb-4">
                <Clock className="w-6 h-6 text-purple-600 mr-3" />
                <h3 className="text-lg font-semibold text-gray-900">{t.customerSupport}</h3>
              </div>
              <p className="text-gray-600">{t.customerSupportDesc}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
