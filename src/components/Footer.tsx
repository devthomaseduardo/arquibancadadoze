
import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle, Phone, Mail, Clock } from "lucide-react";
import { criativos } from "../data/criativos";

const Footer = () => {
  return (
    <footer className="border-t border-primary/20 bg-black py-16">
      <div className="container mx-auto px-4">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <img src={criativos.logoSemFundo} alt="Arquibancada 12" className="mb-4 h-16 w-16 rounded-full object-cover" />
            <h3 className="mb-1 font-heading text-3xl text-white">Arquibancada 12</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Premium Football Wear. Elevando o padrão da sua torcida.
            </p>
          </div>
          <div>
            <h4 className="mb-6 font-heading text-xl text-primary">CATEGORIAS</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/produtos" className="text-zinc-500 hover:text-white">Camisas</Link></li>
              <li><Link to="/produtos?cat=retro-tailandesas" className="text-zinc-500 hover:text-white">Retrô</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-6 font-heading text-xl text-primary">INSTITUCIONAL</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/sobre" className="text-zinc-500 hover:text-white">Quem Somos</Link></li>
              <li><Link to="/faq" className="text-zinc-500 hover:text-white">FAQ</Link></li>
              <li><Link to="/frete" className="text-zinc-500 hover:text-white">Frete</Link></li>
            </ul>
          </div>
          <div className="rounded-2xl border border-white/5 bg-zinc-900 p-6">
            <h4 className="mb-6 font-heading text-xl text-primary">CONTATO</h4>
            <ul className="space-y-4 text-sm text-zinc-400">
              <li className="flex gap-2"><Mail className="h-4 w-4 text-primary" /> contato@arquibancada12.com</li>
              <li className="flex gap-2"><Phone className="h-4 w-4 text-primary" /> (11) 99999-9999</li>
            </ul>
          </div>
        </div>
        <div className="mt-16 pt-8 border-t border-white/5 text-center text-xs text-zinc-600">
          © 2025 Arquibancada 12. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
