import { useCartStore } from '../stores/cartStore';

export function useCart() {
  const store = useCartStore();

  return {
    items: store.items,
    addToCart: store.addItem,
    removeFromCart: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    // Expose as functions to match existing component usage
    getTotalItems: store.getTotalItems,
    getTotalPrice: store.getTotalPrice,
    // Helper to check if item is in cart
    isInCart: (productId: string) => store.items.some(item => item.productId === productId),
    getItemQuantity: (productId: string) => store.items.find(item => item.productId === productId)?.quantity || 0,
  };
}

// Kept for compatibility if used elsewhere
export const CartContext = null;
export const useCartProvider = () => useCart();