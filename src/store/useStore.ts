import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, CartItem, User, Language, ViewMode, ColorTheme, Product, UserReward, Achievement, SurpriseEvent } from '../types';

interface StoreState extends AppState {
  // User actions
  setUser: (user: User | null) => void;
  
  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  
  // UI actions
  setLanguage: (language: Language) => void;
  setViewMode: (mode: ViewMode) => void;
  setColorTheme: (theme: ColorTheme) => void;
  setLoading: (loading: boolean) => void;
  
  // Gamification actions
  setRewards: (rewards: UserReward[]) => void;
  addReward: (reward: UserReward) => void;
  setAchievements: (achievements: Achievement[]) => void;
  setSurpriseEvents: (events: SurpriseEvent[]) => void;
  
  // Computed values
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
  getUnclaimedRewards: () => UserReward[];
  getLoyaltyLevel: () => string;
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      cart: [],
      language: 'en',
      viewMode: '3d',
      colorTheme: 'green',
      loading: false,
      rewards: [],
      achievements: [],
      surpriseEvents: [],

      // User actions
      setUser: (user) => set({ user }),

      // Cart actions
      addToCart: (product, quantity = 1) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.product.id === product.id);
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          });
        } else {
          set({ cart: [...cart, { product, quantity }] });
        }
      },

      removeFromCart: (productId) => {
        const { cart } = get();
        set({ cart: cart.filter(item => item.product.id !== productId) });
      },

      updateCartQuantity: (productId, quantity) => {
        const { cart } = get();
        if (quantity <= 0) {
          get().removeFromCart(productId);
          return;
        }
        
        set({
          cart: cart.map(item =>
            item.product.id === productId
              ? { ...item, quantity }
              : item
          )
        });
      },

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const { cart } = get();
        return cart.reduce((total, item) => {
          let itemPrice = item.product.price;
          
          // Apply discount if available
          if (item.product.discount_percentage && item.product.discount_percentage > 0) {
            itemPrice = itemPrice * (1 - item.product.discount_percentage / 100);
          }
          
          return total + Math.round(itemPrice * item.quantity);
        }, 0);
      },

      getCartItemCount: () => {
        const { cart } = get();
        return cart.reduce((count, item) => count + item.quantity, 0);
      },

      // UI actions
      setLanguage: (language) => set({ language }),
      setViewMode: (viewMode) => set({ viewMode }),
      setColorTheme: (colorTheme) => set({ colorTheme }),
      setLoading: (loading) => set({ loading }),

      // Gamification actions
      setRewards: (rewards) => set({ rewards }),
      addReward: (reward) => {
        const { rewards } = get();
        set({ rewards: [reward, ...rewards] });
      },
      setAchievements: (achievements) => set({ achievements }),
      setSurpriseEvents: (surpriseEvents) => set({ surpriseEvents }),

      // Computed values
      isAuthenticated: () => !!get().user,
      isAdmin: () => !!get().user?.is_admin,
      
      getUnclaimedRewards: () => {
        const { rewards } = get();
        return rewards.filter(reward => !reward.claimed);
      },

      getLoyaltyLevel: () => {
        const { user } = get();
        const points = user?.loyalty_points || 0;
        
        if (points >= 10000) return 'Diamond';
        if (points >= 5000) return 'Gold';
        if (points >= 2000) return 'Silver';
        return 'Bronze';
      },
    }),
    {
      name: 'cameroon-mart-store',
      partialize: (state) => ({
        cart: state.cart,
        language: state.language,
        viewMode: state.viewMode,
        colorTheme: state.colorTheme,
      }),
    }
  )
);