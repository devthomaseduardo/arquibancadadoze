import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useMemo } from "react";

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
  total: number;
  appliedCoupon: CouponData | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
};

const CartContext = createContext<CartContextType | null>(null);
const CART_STORAGE_KEY = "cartState";

type PersistedCart = {
  items: CartItem[];
  appliedCoupon: CouponData | null;
  lastUpdated: number;
};

function normalizeItem(item: CartItem): CartItem {
  return {
    ...item,
    price: Number.isFinite(item.price) && item.price > 0 ? item.price : 0,
    quantity: Number.isFinite(item.quantity) && item.quantity > 0 ? Math.floor(item.quantity) : 1,
    size: item.size?.trim() || "U",
  };
}

function readPersistedCart(): PersistedCart | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PersistedCart;
    if (!Array.isArray(parsed.items)) return null;
    return {
      items: parsed.items.map(normalizeItem),
      appliedCoupon: parsed.appliedCoupon ?? null,
      lastUpdated: parsed.lastUpdated ?? Date.now(),
    };
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const persisted = readPersistedCart();
  const [items, setItems] = useState<CartItem[]>(persisted?.items ?? []);
  const [appliedCoupon, setAppliedCoupon] = useState<CouponData | null>(persisted?.appliedCoupon ?? null);
  const [isCartOpen, setCartOpen] = useState(false);

  const addItem = useCallback((item: CartItem) => {
    const normalized = normalizeItem(item);
    setItems((prev) => {
      const existing = prev.find((i) => i.productId === normalized.productId && i.size === normalized.size);
      if (existing) {
        return prev.map((i) =>
          i.productId === normalized.productId && i.size === normalized.size
            ? { ...i, quantity: i.quantity + normalized.quantity }
            : i
        );
      }
      return [...prev, normalized];
    });
    setCartOpen(true);
  }, []);

  const removeItem = useCallback((productId: string, size: string) => {
    setItems((prev) => prev.filter((i) => !(i.productId === productId && i.size === size)));
  }, []);

  const updateQuantity = useCallback((productId: string, size: string, qty: number) => {
    if (!Number.isFinite(qty) || qty <= 0) {
      removeItem(productId, size);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.productId === productId && i.size === size ? { ...i, quantity: Math.floor(qty) } : i
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCoupon(null);
  }, []);

  const totalItems = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.quantity, 0), [items]);
  const discountAmount = useMemo(() => appliedCoupon ? subtotal * (appliedCoupon.discount / 100) : 0, [appliedCoupon, subtotal]);
  const total = useMemo(() => Math.max(subtotal - discountAmount, 0), [subtotal, discountAmount]);

  const applyCoupon = useCallback((code: string) => {
    const found = AVAILABLE_COUPONS.find((c) => c.code === code.toUpperCase().trim());
    if (found) {
      setAppliedCoupon(found);
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => setAppliedCoupon(null), []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const payload: PersistedCart = {
      items,
      appliedCoupon,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new CustomEvent("cart:updated"));
  }, [items, appliedCoupon]);

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, clearCart,
        totalItems, subtotal, total, appliedCoupon, applyCoupon, removeCoupon,
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
