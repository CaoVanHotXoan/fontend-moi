import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { safeStorage } from '@/utils/storage';
import { Vehicle } from '@/TS/vehicleData';

export type CartItem = {
  vehicle: Vehicle;
  quantity: number;
  addedAt: string;
};

type CartContextType = {
  cartItems: CartItem[];
  savedVehicles: Vehicle[];
  cartCount: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
  addToCart: (vehicle: Vehicle, quantity?: number) => void;
  removeFromCart: (vehicleId: number) => void;
  clearCart: () => void;
  toggleSaveVehicle: (vehicle: Vehicle) => void;
  isSaved: (vehicleId: number) => boolean;
};

const CartContext = createContext<CartContextType>({
  cartItems: [],
  savedVehicles: [],
  cartCount: 0,
  status: 'idle',
  error: null,
  addToCart: () => {},
  removeFromCart: () => {},
  clearCart: () => {},
  toggleSaveVehicle: () => {},
  isSaved: () => false,
});

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  // F5 safe rehydration of Cart and Saved Vehicles domain state
  useEffect(() => {
    try {
      setStatus('loading');
      const loadedCart = safeStorage.getItem<CartItem[]>('cart', []);
      const loadedSaved = safeStorage.getItem<Vehicle[]>('savedVehicles', []);
      setCartItems(Array.isArray(loadedCart) ? loadedCart : []);
      setSavedVehicles(Array.isArray(loadedSaved) ? loadedSaved : []);
      setStatus('success');
    } catch (e) {
      console.error('[CartDomain] Error rehydrating cart:', e);
      setError('Không thể phục hồi giỏ hàng từ bộ nhớ.');
      setStatus('error');
    }
  }, []);

  const addToCart = useCallback((vehicle: Vehicle, quantity = 1) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.vehicle.id === vehicle.id);
      let updated: CartItem[];
      if (existingIndex > -1) {
        updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
      } else {
        updated = [...prev, { vehicle, quantity, addedAt: new Date().toISOString() }];
      }
      safeStorage.setItem('cart', updated);
      return updated;
    });
  }, []);

  const removeFromCart = useCallback((vehicleId: number) => {
    setCartItems((prev) => {
      const updated = prev.filter((item) => item.vehicle.id !== vehicleId);
      safeStorage.setItem('cart', updated);
      return updated;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartItems([]);
    safeStorage.removeItem('cart');
  }, []);

  const toggleSaveVehicle = useCallback((vehicle: Vehicle) => {
    setSavedVehicles((prev) => {
      const exists = prev.some((v) => v.id === vehicle.id);
      const updated = exists ? prev.filter((v) => v.id !== vehicle.id) : [...prev, vehicle];
      safeStorage.setItem('savedVehicles', updated);
      return updated;
    });
  }, []);

  const isSaved = useCallback(
    (vehicleId: number) => savedVehicles.some((v) => v.id === vehicleId),
    [savedVehicles]
  );

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        savedVehicles,
        cartCount,
        status,
        error,
        addToCart,
        removeFromCart,
        clearCart,
        toggleSaveVehicle,
        isSaved,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
