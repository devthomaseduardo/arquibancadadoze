
import { Link } from "react-router-dom";
import { Instagram, Facebook, MessageCircle, Phone, Mail, Clock } from "lucide-react";
import { criativos } from "../data/criativos";

const Footer = () => {
  return (
    <footer className="relative mt-20 overflow-hidden border-t-2 border-primary/40 bg-pitch-light">
      <div className="container mx-auto relative px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="mb-4 inline-block rounded-full border border-primary/20 bg-pitch p-3">
               <img src={criativos.logoSemFundo} alt="Arquibancada 12" className="h-16 w-auto" />
            </div>
            <h3 className="mb-1 font-heading text-3xl tracking-tight">Arquibancada 12</h3>
            <p className="text-xs uppercase tracking-[0.25em] text-primary">Premium Football Wear</p>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Selecionamos camisas premium com alta fidelidade ao manto oficial, focando em conforto, presença e identidade.
            </p>
            <div className="mt-8 flex gap-4">
              {[Instagram, Facebook, MessageCircle].map((Icon, idx) => (
                <a key={idx} href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-primary/20 bg-pitch text-white transition-all hover:scale-110 hover:bg-primary hover:text-pitch">
                  <Icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="mb-6 inline-block border-b border-primary/20 pb-2 font-heading text-xl text-primary">CATEGORIAS</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/produtos?cat=camisas-tailandesas-torcedor" className="text-muted-foreground transition-colors hover:text-white">Linha Torcedor Premium</Link></li>
              <li><Link to="/produtos?cat=retro-tailandesas" className="text-muted-foreground transition-colors hover:text-white">Coleção Retrô Clássica</Link></li>
              <li><Link to="/produtos?cat=conjuntos-infantis-tailandeses" className="text-muted-foreground transition-colors hover:text-white">Kits Infantis</Link></li>
              <li><Link to="/produtos?cat=bones-premium" className="text-muted-foreground transition-colors hover:text-white">Bonés Premium</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 inline-block border-b border-primary/20 pb-2 font-heading text-xl text-primary">ATALHOS</h4>
            <ul className="space-y-4 text-sm">
              <li><Link to="/frete" className="text-muted-foreground transition-colors hover:text-white">Política de Frete</Link></li>
              <li><Link to="/trocas" className="text-muted-foreground transition-colors hover:text-white">Trocas e Devoluções</Link></li>
              <li><Link to="/faq" className="text-muted-foreground transition-colors hover:text-white">Perguntas Frequentes</Link></li>
              <li><Link to="/sobre" className="text-muted-foreground transition-colors hover:text-white">Quem Somos</Link></li>
            </ul>
          </div>

          <div className="rounded-2xl border border-primary/10 bg-pitch p-6">
            <h4 className="mb-6 font-heading text-xl text-primary">CENTRAL DO TORCEDOR</h4>
            <ul className="space-y-5 text-sm">
              <li className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary shrink-0" />
                <div>
                   <p className="font-bold text-white leading-none">Segunda a sexta</p>
                   <p className="text-muted-foreground text-xs">10h às 18h</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <div>
                   <p className="font-bold text-white leading-none">E-mail</p>
                   <p className="text-muted-foreground text-xs">contato@arquibancada12.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <div>
                   <p className="font-bold text-white leading-none">WhatsApp Oficial</p>
                   <a href="https://wa.me/5511999999999" className="text-xs text-primary hover:underline">
                      (11) 99999-9999
                   </a>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-primary/10 pt-8 text-center md:flex-row">
          <p className="text-[11px] text-muted-foreground">
            © 2026 Arquibancada 12. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
