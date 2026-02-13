import { createContext, useContext, useState, useCallback, ReactNode } from "react";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  size: string;
  customName?: string;
  price: number;
  quantity: number;
  categorySlug: string;
};

type CouponData = {
  code: string;
  discount: number; // percentage
  label: string;
};

const AVAILABLE_COUPONS: CouponData[] = [
  { code: "PENABOLA10", discount: 10, label: "10% OFF" },
  { code: "TORCIDA15", discount: 15, label: "15% OFF" },
  { code: "PRIMEIRACOMPRA", discount: 20, label: "20% OFF na primeira compra" },
];

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  appliedCoupon: CouponData | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(null);
  const [isCartOpen, setCartOpen] = useState(false);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === item.productId && i.size === item.size);
      if (existing) {
        return prev.map((i) =>
          i.productId === item.productId && i.size === item.size
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, qty: number) => {
    if (qty <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size ? { ...i, quantity: qty } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const discountAmount = appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0;

  const applyCoupon = useCallback((code: string) => {
    const found = AVAILABLE_COUPONS.find((c) => c.code === code.toUpperCase().trim());
    if (found) {
      setAppliedCoupon(found);
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, clearCart,
        totalItems, subtotal, appliedCoupon, applyCoupon, removeCoupon,
        discountAmount, isCartOpen, setCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
