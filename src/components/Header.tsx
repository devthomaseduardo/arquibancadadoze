
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Search, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { criativos } from "../data/criativos";
import NavLink from "./NavLink";
import { cn } from "../lib/utils";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/produtos", label: "Mantos" },
  { to: "/produtos?cat=retro-tailandesas", label: "Retrô" },
  { to: "/produtos?cat=conjuntos-infantis-tailandeses", label: "Infantil" },
  { to: "/faq", label: "Rastreio" },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { totalItems, setCartOpen } = useCart();
  const { user } = useAuth();

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={cn("sticky top-0 z-50 transition-all duration-300", scrolled ? "bg-black/95 shadow-2xl" : "bg-black")}>
      {/* Promo Bar Compacta e Veloz */}
      <div className="overflow-hidden bg-primary/90 border-b border-white/10 backdrop-blur-sm">
        <div className="animate-marquee flex whitespace-nowrap py-1">
          <div className="flex shrink-0 items-center gap-12 px-6 font-fat text-[9px] font-black uppercase tracking-[0.2em] text-white italic">
            <span>🔥 FRETE REGIONAL GRÁTIS ACIMA DE R$ 500</span>
            <span>•</span>
            <span>QUALIDADE TAILANDESA PREMIUM 1:1</span>
            <span>•</span>
            <span>PERSONALIZAÇÃO OFICIAL GRÁTIS</span>
            <span>•</span>
            <span>FIRE DEALS: MANTOS RETRÔ EM OFERTA</span>
            <span>•</span>
          </div>
          {/* Duplicate for infinite loop */}
          <div className="flex shrink-0 items-center gap-12 px-6 font-fat text-[9px] font-black uppercase tracking-[0.2em] text-white italic">
            <span>🔥 FRETE REGIONAL GRÁTIS ACIMA DE R$ 500</span>
            <span>•</span>
            <span>QUALIDADE TAILANDESA PREMIUM 1:1</span>
            <span>•</span>
            <span>PERSONALIZAÇÃO OFICIAL GRÁTIS</span>
            <span>•</span>
            <span>FIRE DEALS: MANTOS RETRÔ EM OFERTA</span>
            <span>•</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto flex items-center justify-between px-4 py-3 md:py-4">
        <Link to="/" className="group flex items-center gap-3">
          <div className="relative h-10 w-10 md:h-12 md:w-12">
            <div className="absolute inset-0 rounded-full border-2 border-primary p-0.5 shadow-[0_0_10px_rgba(139,92,246,0.3)]">
              <img src={criativos.logoSemFundo} alt="Logo" className="h-full w-full rounded-full object-cover" />
            </div>
          </div>
          <div className="hidden sm:block">
            <h1 className="font-fat text-xl italic tracking-tighter text-white leading-none">
              ARQUIBANCADA <span className="text-primary">12</span>
            </h1>
            <p className="text-[7px] font-black uppercase tracking-[0.5em] text-primary/80">Premium Gear</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className="font-fat text-[10px] font-black uppercase tracking-widest text-white/50 transition-all hover:text-primary hover:tracking-[0.2em] italic"
              activeClassName="text-primary tracking-[0.2em]"
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link to="/login" className="hidden items-center gap-2 rounded-lg bg-secondary/80 px-4 py-2 text-[9px] font-black uppercase text-white border border-white/5 transition-all hover:bg-primary md:flex">
            <User className="h-3 w-3" />
            {user ? user.name.split(" ")[0] : "Login"}
          </Link>

          <button onClick={() => setCartOpen(true)} className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/20 transition-all hover:scale-110 active:scale-95">
            <ShoppingCart className="h-4 w-4" />
            <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[9px] font-black text-black shadow-md">
              {totalItems}
            </span>
          </button>

          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-white">
            <Menu className="h-7 w-7" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 z-[60] w-full bg-black/95 backdrop-blur-xl p-10 md:w-80"
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-12">
                <h2 className="font-fat text-3xl italic text-white uppercase tracking-tighter">Menu</h2>
                <button onClick={() => setMobileOpen(false)} className="text-primary"><X className="h-10 w-10" /></button>
              </div>
              <div className="flex flex-col gap-6">
                {navLinks.map((link) => (
                  <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)} className="font-fat text-4xl italic text-white uppercase tracking-tighter hover:text-primary transition-all hover:translate-x-2">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { animation: marquee 20s linear infinite; }
      `}</style>
    </header>
  );
};

export default Header;
