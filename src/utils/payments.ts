// Payment adapter interface for easy switching between payment providers
export interface PaymentMethod {
  id: string;
  name: string;
  name_fr: string;
  type: 'cod' | 'momo' | 'orange';
  available: boolean;
}

export const paymentMethods: PaymentMethod[] = [
  {
    id: 'cod',
    name: 'Cash on Delivery',
    name_fr: 'Paiement à la livraison',
    type: 'cod',
    available: true,
  },
  {
    id: 'mtn_momo',
    name: 'MTN Mobile Money',
    name_fr: 'MTN Mobile Money',
    type: 'momo',
    available: true,
  },
  {
    id: 'orange_money',
    name: 'Orange Money',
    name_fr: 'Orange Money',
    type: 'orange',
    available: true,
  },
];

// Mock Mobile Money payment processor
export class MobileMoneyProcessor {
  static async processMTNPayment(amount: number, phone: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock validation
    if (!phone.match(/^(237)?[0-9]{8,9}$/)) {
      return { success: false, error: 'Invalid phone number format' };
    }
    
    if (amount < 100) {
      return { success: false, error: 'Minimum amount is 100 FCFA' };
    }
    
    // Mock success (90% success rate)
    const success = Math.random() > 0.1;
    
    if (success) {
      return {
        success: true,
        transactionId: `MTN${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please check your mobile money balance and try again.',
      };
    }
  }
  
  static async processOrangePayment(amount: number, phone: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Mock validation
    if (!phone.match(/^(237)?[0-9]{8,9}$/)) {
      return { success: false, error: 'Invalid phone number format' };
    }
    
    if (amount < 100) {
      return { success: false, error: 'Minimum amount is 100 FCFA' };
    }
    
    // Mock success (85% success rate)
    const success = Math.random() > 0.15;
    
    if (success) {
      return {
        success: true,
        transactionId: `ORA${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
      };
    } else {
      return {
        success: false,
        error: 'Payment failed. Please check your Orange Money balance and try again.',
      };
    }
  }
}

// Cash on Delivery processor
export class CODProcessor {
  static async processCODOrder(): Promise<{ success: boolean; orderId?: string }> {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    return {
      success: true,
      orderId: `COD${Date.now()}${Math.random().toString(36).substr(2, 9)}`.toUpperCase(),
    };
  }
}

// Order status helpers
export const orderStatuses = {
  processing: { en: 'Processing', fr: 'En cours' },
  dispatched: { en: 'Dispatched', fr: 'Expédié' },
  delivered: { en: 'Delivered', fr: 'Livré' },
  cancelled: { en: 'Cancelled', fr: 'Annulé' },
};

export function getOrderStatusText(status: string, language: 'en' | 'fr') {
  return orderStatuses[status as keyof typeof orderStatuses]?.[language] || status;
}