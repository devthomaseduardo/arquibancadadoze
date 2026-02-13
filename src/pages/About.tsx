
import React, { useState } from "react";
import { Mail, Send, Instagram, Facebook, MessageCircle } from "lucide-react";
import Layout from "../components/Layout";
import { criativos } from "../data/criativos";
import BannerCarousel from "../components/BannerCarousel";
import { toast } from "sonner";

const About = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Por favor, preencha todos os campos!");
      return;
    }
    
    // Simulate API call
    toast.success("Mensagem enviada com sucesso!", {
      description: "Nossa equipe entrará em contato em breve."
    });
    
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <Layout>
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <h1 className="font-heading text-4xl text-white uppercase mb-12 text-center md:text-left">
          Quem Somos & <span className="text-primary">Contato</span>
        </h1>
        
        <div className="grid gap-16 lg:grid-cols-2">
          {/* About Section */}
          <div className="space-y-8">
            <div className="rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl shadow-primary/5">
              <BannerCarousel
                images={[
                  { src: criativos.bannerPrincipal, alt: "A12 Lifestyle" },
                  { src: criativos.bannerSecundario, alt: "Qualidade Premium" },
                ]}
                className="aspect-video"
              />
            </div>
            
            <div className="space-y-6 text-zinc-400 leading-relaxed text-lg">
              <p>
                A <strong>Arquibancada 12</strong> nasceu da paixão visceral pelo futebol. 
                Somos mais do que uma loja; somos o ponto de encontro de quem vive o jogo intensamente, 
                da arquibancada para as ruas.
              </p>
              <p>
                Nossa missão é democratizar o acesso a camisas de altíssima qualidade, 
                trabalhando exclusivamente com o padrão tailandês premium 1:1, garantindo 
                que cada detalhe — do tecido tecnológico aos bordados impecáveis — honre 
                a história do seu time.
              </p>
              
              <div className="pt-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Siga nossa paixão</h3>
                <div className="flex gap-4">
                  {[Instagram, Facebook, MessageCircle].map((Icon, i) => (
                    <a 
                      key={i} 
                      href="#" 
                      className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-primary hover:border-primary transition-all duration-300"
                    >
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Section */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 md:p-10 backdrop-blur-sm h-fit">
            <div className="flex items-center gap-3 mb-8">
              <Mail className="h-6 w-6 text-primary" />
              <h2 className="font-heading text-2xl text-white uppercase tracking-tight">Fale com a gente</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block ml-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Seu nome"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-black/50 px-4 py-3.5 text-white outline-none focus:border-primary/50 transition-all duration-300 placeholder:text-zinc-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block ml-1">
                  Endereço de E-mail
                </label>
                <input
                  type="email"
                  required
                  placeholder="exemplo@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-black/50 px-4 py-3.5 text-white outline-none focus:border-primary/50 transition-all duration-300 placeholder:text-zinc-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] block ml-1">
                  Sua Mensagem
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Conte-nos como podemos ajudar..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-zinc-800 bg-black/50 px-4 py-3.5 text-white outline-none focus:border-primary/50 transition-all duration-300 resize-none placeholder:text-zinc-700"
                />
              </div>
              
              <button
                type="submit"
                className="w-full gradient-primary rounded-xl py-4 font-heading text-lg text-white flex items-center justify-center gap-3 shadow-xl shadow-primary/10 transition-all duration-300 hover:scale-[1.01] hover:brightness-110 active:scale-95 group"
              >
                <Send className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                ENVIAR MENSAGEM
              </button>
            </form>
            
            <p className="mt-8 text-center text-xs text-zinc-600">
              Retornamos em até 24h úteis.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
