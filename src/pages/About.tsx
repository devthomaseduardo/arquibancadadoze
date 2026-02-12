import { useMemo, useState } from "react";
import Layout from "@/components/Layout";
import { Instagram, Facebook, Twitter, MessageCircle, Mail, Send } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getConfig } from "@/lib/api";
import { parseConfigValue } from "@/lib/store-mappers";
import { criativos } from "@/data/criativos";
import BannerCarousel from "@/components/BannerCarousel";

type AboutConfig = { title?: string; text?: string };
type BusinessHoursConfig = { text?: string };

const About = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const { data: config = {} } = useQuery({
    queryKey: ["site-config", "about"],
    queryFn: () =>
      getConfig([
        "about",
        "business_hours",
        "contact_whatsapp",
        "contact_email",
        "contact_instagram",
        "contact_facebook",
      ]),
  });

  const about = useMemo(() => parseConfigValue<AboutConfig>(config.about, {}), [config.about]);
  const businessHours = useMemo(
    () => parseConfigValue<BusinessHoursConfig>(config.business_hours, {}),
    [config.business_hours],
  );

  const whatsapp = config.contact_whatsapp || "5511999999999";
  const email = config.contact_email || "contato@arquibancada12.com";
  const instagram = config.contact_instagram || "#";
  const facebook = config.contact_facebook || "#";

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
        <h1 className="font-heading text-4xl text-foreground">{about.title?.toUpperCase() || "QUEM SOMOS"}</h1>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div className="space-y-4 text-sm text-foreground/80">
            <div className="overflow-hidden rounded-2xl border border-border">
              <BannerCarousel
                images={[
                  { src: criativos.bannerSecundario, alt: "Criativo Arquibancada 12" },
                  { src: criativos.bannerPrincipal, alt: "Paixão de torcedor" },
                ]}
                className="rounded-2xl border border-border"
              />
            </div>

            <p>{about.text || "Somos apaixonados por futebol e estilo."}</p>

            <div className="mt-6">
              <h3 className="font-heading text-xl text-foreground">HORÁRIO DE ATENDIMENTO</h3>
              <p className="mt-2">{businessHours.text || "Atendimento em horário comercial."}</p>
            </div>

            <div className="mt-6 flex gap-3">
              <a href={instagram} className="rounded-lg bg-muted p-3 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Instagram className="h-5 w-5" />
              </a>
              <a href={facebook} className="rounded-lg bg-muted p-3 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="rounded-lg bg-muted p-3 transition-colors hover:bg-primary hover:text-primary-foreground">
                <Twitter className="h-5 w-5" />
              </a>
              <a href={`https://wa.me/${whatsapp}`} className="rounded-lg bg-muted p-3 transition-colors hover:bg-primary hover:text-primary-foreground">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-primary" />
              <h3 className="font-heading text-xl text-foreground">FALE CONOSCO</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">E-mail: {email}</p>
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
