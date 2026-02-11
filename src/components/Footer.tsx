import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, MessageCircle } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-secondary/50 spray-texture">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="font-heading text-2xl text-primary text-neon-glow">TORCIDA URBANA</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Estilo urbano e paixão por futebol. As melhores camisas de times com qualidade premium.
            </p>
            <div className="mt-4 flex gap-3">
              <a href="#" className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="https://wa.me/5511999999999" className="rounded-lg bg-muted p-2 transition-colors hover:bg-primary hover:text-primary-foreground">
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg text-foreground">CATEGORIAS</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/produtos?cat=tailandesa-torcedor" className="hover:text-primary">Tailandesas Torcedor</Link></li>
              <li><Link to="/produtos?cat=retro-tailandesas" className="hover:text-primary">Retrô</Link></li>
              <li><Link to="/produtos?cat=modelo-jogador" className="hover:text-primary">Modelo Jogador</Link></li>
              <li><Link to="/produtos?cat=bones-premium" className="hover:text-primary">Bonés</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg text-foreground">INFORMAÇÕES</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/frete" className="hover:text-primary">Política de Frete</Link></li>
              <li><Link to="/trocas" className="hover:text-primary">Trocas e Devoluções</Link></li>
              <li><Link to="/faq" className="hover:text-primary">Perguntas Frequentes</Link></li>
              <li><Link to="/sobre" className="hover:text-primary">Quem Somos</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg text-foreground">ATENDIMENTO</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>📞 Pedidos: 10h às 17h</li>
              <li>💬 Atendimento até 18h</li>
              <li>📧 contato@torcidaurbana.com</li>
              <li>
                <a href="https://wa.me/5511999999999" className="text-primary hover:underline">
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 text-center text-xs text-muted-foreground">
          © 2026 Torcida Urbana. Todos os direitos reservados.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
