import Layout from "@/components/Layout";
import { RefreshCw } from "lucide-react";

const Returns = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-8 w-8 text-primary" />
          <h1 className="font-heading text-4xl text-foreground">TROCAS E DEVOLUÇÕES</h1>
        </div>

        <div className="mt-8 space-y-6">
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-heading text-xl text-foreground">QUANDO ACEITAMOS TROCAS</h3>
            <ul className="mt-3 space-y-2 text-sm text-foreground/80">
              <li>✅ <strong>Defeito de fabricação</strong> — costuras soltas, estampas com falhas, tecido danificado</li>
              <li>✅ <strong>Tamanho errado enviado</strong> — quando o tamanho recebido é diferente do pedido</li>
            </ul>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-heading text-xl text-foreground">PRAZO PARA SOLICITAÇÃO</h3>
            <p className="mt-3 text-sm text-foreground/80">
              O prazo para solicitar troca é de <span className="font-semibold text-primary">7 dias corridos</span> após 
              o recebimento do produto. Após esse período, a troca não será aceita.
            </p>
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-heading text-xl text-foreground">COMO SOLICITAR</h3>
            <ol className="mt-3 space-y-2 text-sm text-foreground/80">
              <li>1. Entre em contato pelo WhatsApp ou e-mail dentro do prazo de 7 dias</li>
              <li>2. Envie fotos do produto com o defeito ou do tamanho incorreto</li>
              <li>3. Aguarde a análise da nossa equipe (até 48h)</li>
              <li>4. Se aprovada, envie o produto de volta (frete por nossa conta)</li>
              <li>5. Novo produto enviado em até 5 dias úteis após recebimento</li>
            </ol>
          </div>

          <div className="rounded-lg border border-accent/30 bg-accent/5 p-6">
            <h3 className="font-heading text-xl text-accent">ATENÇÃO</h3>
            <p className="mt-3 text-sm text-foreground/80">
              Trocas por <strong>arrependimento</strong>, troca de tamanho por preferência pessoal ou 
              demais motivos que não sejam defeito de fabricação ou envio incorreto são de 
              <strong> responsabilidade do cliente</strong>, incluindo os custos de envio.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Returns;
