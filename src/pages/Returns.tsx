
import React from "react";
import Layout from "../components/Layout";
import { RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";

const Returns = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary" />
          <h1 className="font-heading text-4xl text-white uppercase tracking-tight">Trocas e Devoluções</h1>
        </div>

        <div className="mt-8 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold uppercase tracking-widest text-sm">
              <ShieldCheck className="w-4 h-4" />
              Sua satisfação é nossa prioridade
            </div>
            <p className="text-zinc-400 leading-relaxed text-lg">
              Na <span className="text-white font-bold">Arquibancada 12</span>, queremos que você vista seu manto com orgulho. 
              Caso precise trocar ou devolver seu produto, confira nossa política baseada no Código de Defesa do Consumidor.
            </p>
          </section>

          <div className="grid gap-6">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h3 className="font-heading text-xl text-white mb-3">Direito de Arrependimento</h3>
              <p className="text-sm text-zinc-400">
                Você tem até <strong className="text-white">7 dias corridos</strong> após o recebimento do produto 
                para solicitar a devolução por arrependimento. O produto deve estar com as etiquetas originais, 
                sem marcas de uso e em sua embalagem original.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-6">
              <h3 className="font-heading text-xl text-white mb-3">Defeitos de Fabricação</h3>
              <p className="text-sm text-zinc-400">
                Caso o produto apresente defeitos de fabricação (bordados falhos, costuras soltas, erros na personalização), 
                entre em contato conosco em até <strong className="text-white">30 dias</strong>. A troca será realizada sem custos adicionais.
              </p>
            </div>

            <div className="rounded-2xl border border-red-900/20 bg-red-900/5 p-6 border-dashed">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-3 uppercase text-xs tracking-widest">
                <AlertCircle className="w-4 h-4" />
                Atenção Especial
              </div>
              <p className="text-sm text-zinc-500">
                Produtos <strong className="text-zinc-300">Personalizados</strong> (com nome e número escolhidos pelo cliente) 
                só poderão ser trocados em caso de defeito de fabricação ou erro na personalização por nossa parte. 
                Não realizamos trocas de personalizados por escolha incorreta de tamanho.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-zinc-800 pt-8">
            <h3 className="font-heading text-2xl text-white">Como solicitar?</h3>
            <p className="text-zinc-400 text-sm">
              Para iniciar o processo, entre em contato com nosso suporte via WhatsApp enviando fotos do produto e o número do pedido.
            </p>
            <a 
              href="https://wa.me/5511999999999" 
              className="inline-flex items-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 px-6 py-3 text-sm font-bold text-white hover:border-primary transition-all duration-300"
            >
              Falar com Suporte no WhatsApp
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Returns;
