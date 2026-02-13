import { Link } from "react-router-dom";
import { X, Plus, Minus, Trash2, ShoppingBag, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";

const CartSidebar = () => {
  const {
    items, removeItem, updateQuantity, clearCart,
    totalItems, subtotal, total, appliedCoupon, applyCoupon,
    removeCoupon, discountAmount, isCartOpen, setCartOpen,
  } = useCart();
  const [couponInput, setCouponInput] = useState("");
  const { toast } = useToast();

  const handleApplyCoupon = () => {
    if (applyCoupon(couponInput)) {
      toast({ title: "Cupom aplicado!", description: `Desconto de ${couponInput.toUpperCase()} ativado.` });
      setCouponInput("");
    } else {
      toast({ title: "Cupom inválido", description: "Verifique o código e tente novamente.", variant: "destructive" });
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/60 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                <h2 className="font-heading text-2xl text-foreground">CARRINHO ({totalItems})</h2>
              </div>
              <button onClick={() => setCartOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-4 text-sm text-muted-foreground">Seu carrinho está vazio</p>
                  <Link
                    to="/produtos"
                    onClick={() => setCartOpen(false)}
                    className="mt-4 text-sm text-primary hover:underline"
                  >
                    Ver produtos
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={`${item.productId}-${item.size}`} className="flex gap-3 rounded-lg border border-border bg-secondary/30 p-3">
                      <img src={item.image} alt={item.name} className="h-20 w-16 rounded-md object-cover" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">Tam: {item.size}</p>
                        {item.customName && <p className="text-xs text-primary">Nome: {item.customName}</p>}
                        <p className="mt-1 text-sm font-semibold text-primary">
                          R$ {(item.price * item.quantity).toFixed(2).replace(".", ",")}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="rounded border border-border p-1 text-muted-foreground hover:border-primary hover:text-primary"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[20px] text-center text-sm text-foreground">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.size, item.quantity + 1)}
                            className="rounded border border-border p-1 text-muted-foreground hover:border-primary hover:text-primary"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                          <button
                            onClick={() => removeItem(item.productId, item.size)}
                            className="ml-auto text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button onClick={clearCart} className="text-xs text-muted-foreground hover:text-destructive">
                    Limpar carrinho
                  </button>
                </div>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-border p-5">
                {/* Coupon */}
                <div className="mb-4">
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/10 px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        <span className="text-sm text-foreground">{appliedCoupon.code} — {appliedCoupon.label}</span>
                      </div>
                      <button onClick={removeCoupon} className="text-xs text-muted-foreground hover:text-destructive">Remover</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="Cupom de desconto"
                        className="flex-1 rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground"
                        onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                      />
                      <button onClick={handleApplyCoupon} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                        Aplicar
                      </button>
                    </div>
                  )}
                </div>

                <div className="space-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace(".", ",")}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-primary">
                      <span>Desconto ({appliedCoupon.discount}%)</span>
                      <span>- R$ {discountAmount.toFixed(2).replace(".", ",")}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-muted-foreground">
                    <span>Frete</span>
                    <span>Calculado no checkout</span>
                  </div>
                  <div className="flex justify-between border-t border-border pt-2 font-heading text-xl text-foreground">
                    <span>Total</span>
                    <span className="text-primary">R$ {total.toFixed(2).replace(".", ",")}</span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  onClick={() => setCartOpen(false)}
                  className="gradient-primary mt-4 flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-heading text-lg text-primary-foreground neon-glow disabled:opacity-50"
                  aria-disabled={items.length === 0}
                  onClick={(e) => {
                    if (items.length === 0) {
                      e.preventDefault();
                      return;
                    }
                    setCartOpen(false);
                  }}
                >
                  FINALIZAR COMPRA
                </Link>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
