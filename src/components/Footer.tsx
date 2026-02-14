
import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle, Mail } from "lucide-react";
import { criativos } from "../data/criativos";

const Footer = () => {
  return (
    <footer className="border-t border-white/5 bg-black py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={criativos.logoSemFundo}
              alt="Arquibancada 12"
              className="h-10 w-10 rounded-full object-cover"
              onError={(e) => {
                const el = e.currentTarget;
                if (el.src.endsWith(".png")) el.src = "/favicon.ico";
              }}
            />
            <div>
              <h3 className="font-heading text-lg text-white">Arquibancada 12</h3>
              <p className="text-xs text-zinc-500">Premium Football Wear</p>
            </div>
          </div>
          <nav className="flex flex-wrap items-center gap-6 text-sm">
            <Link to="/produtos" className="text-zinc-500 hover:text-white transition-colors">Produtos</Link>
            <Link to="/sobre" className="text-zinc-500 hover:text-white transition-colors">Sobre</Link>
            <Link to="/faq" className="text-zinc-500 hover:text-white transition-colors">FAQ</Link>
            <Link to="/frete" className="text-zinc-500 hover:text-white transition-colors">Frete</Link>
          </nav>
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all" aria-label="Instagram">
              <Instagram className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all" aria-label="Facebook">
              <Facebook className="h-4 w-4" />
            </a>
            <a href="#" className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-primary hover:bg-primary/10 transition-all" aria-label="WhatsApp">
              <MessageCircle className="h-4 w-4" />
            </a>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-zinc-600">
          <span>© {new Date().getFullYear()} Arquibancada 12</span>
          <a href="mailto:contato@arquibancada12.com" className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors">
            <Mail className="h-3 w-3" /> contato@arquibancada12.com
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
