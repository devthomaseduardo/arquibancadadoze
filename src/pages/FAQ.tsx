
import React from "react";
import { HelpCircle, PackageSearch } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Layout from "../components/Layout";
import { getFaq } from "../lib/api";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../components/ui/accordion";
import TrackingInput from "../components/TrackingInput";

const FAQ = () => {
  const { data = [], isLoading } = useQuery({ queryKey: ["faq"], queryFn: getFaq });

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        {/* Tracking Section First */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <PackageSearch className="h-8 w-8 text-primary" />
            <h1 className="font-heading text-4xl text-white uppercase">Acompanhar Pedido</h1>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8">
            <p className="text-zinc-400 mb-6 text-sm">
              Insira o seu código de rastreamento enviado por e-mail para verificar o status atual da sua entrega. 
              O código costuma ser liberado em até 5 dias úteis após a confirmação.
            </p>
            <TrackingInput />
          </div>
        </div>

        {/* FAQ Section */}
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h2 className="font-heading text-4xl text-white uppercase">Perguntas Frequentes</h2>
        </div>

        {isLoading ? (
          <div className="py-10 text-center">
            <p className="text-zinc-500 animate-pulse">Carregando central de ajuda...</p>
          </div>
        ) : (
          <Accordion className="space-y-4">
            {data.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 px-6">
                <AccordionTrigger className="text-left font-heading text-lg text-white hover:text-primary transition-colors">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-zinc-400 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}

        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <h3 className="font-heading text-xl text-white mb-2">Ainda tem dúvidas?</h3>
          <p className="text-zinc-400 text-sm mb-6">Nossa equipe de suporte está pronta para te ajudar na arquibancada.</p>
          <a 
            href="https://wa.me/5511999999999" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-8 py-3 font-heading text-white transition-all hover:scale-105 active:scale-95"
          >
            CHAMAR NO WHATSAPP
          </a>
        </div>
      </div>
    </Layout>
  );
};

export default FAQ;
