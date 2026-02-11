import { useState } from "react";
import Layout from "@/components/Layout";
import { Instagram, Facebook, Twitter, MessageCircle, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const About = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast({ title: "Preencha todos os campos", variant: "destructive" });
      return;
    }
    toast({ title: "Mensagem enviada!", description: "Entraremos em contato em breve." });
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <h1 className="font-heading text-4xl text-foreground">QUEM SOMOS</h1>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-sm text-foreground/80">
            <p>
              A <strong className="text-primary">Pé na Bola</strong> nasceu da paixão por futebol e do compromisso 
              com qualidade. Acreditamos que vestir a camisa do seu time é mais do que torcer — é expressar 
              sua identidade, sua história e seu estilo.
            </p>
            <p>
              Trabalhamos com as melhores camisas de qualidade tailandesa e nacional premium, 
              garantindo que cada peça tenha acabamento impecável, tecido confortável e fidelidade 
              ao design original.
            </p>
            <p>
              Nossa missão é democratizar o acesso a camisas de futebol de qualidade, com preços 
              justos e atendimento direto e transparente. Marca brasileira feita para torcedores.
            </p>

            <div className="mt-6">
              <h3 className="font-heading text-xl text-foreground">NOSSOS VALORES</h3>
              <ul className="mt-3 space-y-2">
                <li>⚽ Paixão genuína por futebol</li>
                <li>🏆 Compromisso com qualidade</li>
                <li>💰 Preço justo</li>
                <li>🤝 Atendimento direto e transparente</li>
                <li>💚 Preços acessíveis para todos</li>
              </ul>
            </div>

            <div className="mt-6">
              <h3 className="font-heading text-xl text-foreground">HORÁRIO DE ATENDIMENTO</h3>
              <p className="mt-2">📞 Pedidos: 10h às 17h</p>
              <p>💬 Atendimento geral: até 18h</p>
              <p className="mt-2">Segunda a sexta-feira</p>
            </div>

            <div className="mt-6 flex gap-3">
              <a href="#" className="rounded-lg bg-muted p-3 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-muted p-3 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-muted p-3 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="https://wa.me/5511999999999" className="rounded-lg bg-muted p-3 transition-colors hover:bg-primary hover:text-primary-foreground">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-xl text-foreground">FALE CONOSCO</h3>
            </div>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  maxLength={100}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">E-mail</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  maxLength={255}
                  className="w-full rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-muted-foreground">Mensagem</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  maxLength={1000}
                  className="w-full resize-none rounded-lg border border-border bg-secondary px-4 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="gradient-primary flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-heading text-lg text-primary-foreground transition-all hover:opacity-90 neon-glow"
              >
                <Send className="h-4 w-4" />
                ENVIAR MENSAGEM
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
