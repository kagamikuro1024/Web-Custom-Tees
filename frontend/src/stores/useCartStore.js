import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

const useCartStore = create(
  persist(
    (set, get) => ({
      cart: null,
      isLoading: false,

      // Fetch cart
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.get('/cart');
          set({ cart: data.data, isLoading: false });
          return data.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Add to cart
      addToCart: async (cartItem) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/cart/items', cartItem);
          set({ cart: data.data, isLoading: false });
          toast.success('Added to cart!');
          return data.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Update cart item quantity
      updateCartItem: async (itemId, quantity) => {
        set({ isLoading: true });
        try {
          const { data } = await api.put(`/cart/items/${itemId}`, { quantity });
          set({ cart: data.data, isLoading: false });
          toast.success('Cart updated');
          return data.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Remove cart item
      removeCartItem: async (itemId) => {
        set({ isLoading: true });
        try {
          const { data } = await api.delete(`/cart/items/${itemId}`);
          set({ cart: data.data, isLoading: false });
          toast.success('Item removed from cart');
          return data.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Clear cart
      clearCart: async () => {
        set({ isLoading: true });
        try {
          const { data } = await api.delete('/cart/clear');
          set({ cart: data.data, isLoading: false });
          return data.data;
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      // Get cart item count
      getCartItemCount: () => {
        return get().cart?.totalItems || 0;
      },

      // Get cart total
      getCartTotal: () => {
        return get().cart?.totalPrice || 0;
      },
    }),
    {
      name: 'cart-storage',
      partialize: (state) => ({
        cart: state.cart,
      }),
    }
  )
);

export default useCartStore;
