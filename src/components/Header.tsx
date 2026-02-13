import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { criativos } from "@/data/criativos";
import NavLink from "@/components/NavLink";
import { cn } from "@/lib/utils";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Início" },
  { to: "/produtos", label: "Camisas" },
  { to: "/produtos?cat=retro-tailandesas", label: "Retrô" },
  { to: "/produtos?cat=conjuntos-infantis-tailandeses", label: "Infantil" },
  { to: "/produtos?cat=modelos-jogador-tailandeses", label: "Personalizadas" },
  { to: "/faq", label: "Rastreio" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { totalItems, setCartOpen } = useCart();
  const { user } = useAuth();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const cartCount = totalItems > 99 ? "99+" : String(totalItems);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b border-primary/20 backdrop-blur-lg transition-all duration-300",
        scrolled ? "bg-pitch/85 py-1" : "bg-pitch/95 py-0",
      )}
    >
      <div className="overflow-hidden whitespace-nowrap bg-primary py-1">
        <div className="animate-marquee flex gap-12 font-heading text-[10px] font-bold uppercase tracking-widest text-pitch">
          <span>Envio grátis para todo o Brasil em compras acima de R$ 350</span>
          <span>•</span>
          <span>Camisas tailandesas premium com alto padrão de acabamento</span>
          <span>•</span>
          <span>Personalização gratuita por tempo limitado</span>
          <span>•</span>
          <span>Envio grátis para todo o Brasil em compras acima de R$ 350</span>
        </div>
      </div>

      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link to="/" className="group flex items-center gap-2 transition-transform hover:scale-105">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-primary/20 blur-md transition-colors group-hover:bg-primary/40"></div>
            <img
              src={criativos.logoSemFundo}
              alt="Arquibancada 12"
              className="relative h-12 w-auto rounded-full border border-primary/40 md:h-16"
            />
          </div>
          <div className="hidden sm:block">
            <h1 className="font-heading text-2xl leading-none tracking-tighter text-white italic">
              Arquibancada <span className="text-primary">12</span>
            </h1>
            <p className="font-subheading text-[10px] uppercase tracking-widest text-muted-foreground">Premium Football Wear</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="font-subheading text-sm font-semibold uppercase tracking-tighter text-white/70 transition-all hover:text-primary hover:tracking-normal"
              activeClassName="border-b-2 border-primary pb-1 text-primary"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button className="hidden rounded-full bg-muted p-2.5 transition-all hover:bg-primary hover:text-pitch md:block">
            <Search className="h-5 w-5" />
          </button>

          <Link
            to="/login"
            className="hidden items-center gap-2 border border-white/10 bg-pitch-light px-4 py-1.5 text-xs font-bold uppercase transition-all hover:border-primary hover:bg-primary/10 md:flex"
          >
            <span className="skew-content flex items-center gap-2">
              <User className="h-4 w-4 text-primary" />
              {user ? user.name.split(" ")[0] : "Entrar"}
            </span>
          </Link>

          <button
            onClick={() => setCartOpen(true)}
            className="neon-glow relative flex items-center justify-center rounded-full bg-primary p-2.5 text-pitch transition-all hover:scale-110 active:scale-95"
          >
            <ShoppingCart className="h-5 w-5 stroke-[2.5px]" />
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-black text-pitch ring-2 ring-pitch">
              {cartCount}
            </span>
          </button>

          <button onClick={() => setMobileOpen(!mobileOpen)} className="rounded-lg bg-muted p-2 text-white md:hidden">
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed inset-y-0 right-0 z-[60] w-3/4 border-l-2 border-primary/30 bg-pitch-light shadow-2xl md:hidden"
          >
            <div className="flex h-full flex-col p-6">
              <div className="mb-10 flex items-center justify-between">
                <h2 className="font-heading text-3xl italic">Menu</h2>
                <button onClick={() => setMobileOpen(false)}>
                  <X className="h-8 w-8 text-primary" />
                </button>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "font-heading text-2xl uppercase italic transition-colors",
                      location.pathname === link.to ? "text-primary" : "text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-auto border-t border-white/10 pt-6">
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="flex items-center gap-3 font-heading text-lg text-white">
                    <User className="h-6 w-6 text-primary" />
                    {user ? "Minha conta" : "Entrar"}
                  </Link>
                </div>
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          animation: marquee 25s linear infinite;
        }
      `}</style>
    </header>
  );
};

export default Header;
