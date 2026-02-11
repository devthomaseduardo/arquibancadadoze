import Layout from "@/components/Layout";
import { HelpCircle } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Qual a diferença entre camisa torcedor e jogador?",
    a: "A camisa torcedor tem corte mais amplo e confortável para o dia a dia. A camisa jogador (player) tem corte slim, tecido mais leve e tecnologia de performance, igual à usada pelos atletas em campo.",
  },
  {
    q: "Como funciona a tabela de tamanhos?",
    a: "Nossas camisas seguem a numeração padrão brasileira. P (veste 36-38), M (veste 38-40), G (veste 40-42), GG (veste 42-44), XGG (veste 44-46). Para conjuntos infantis, os tamanhos correspondem à idade da criança (2, 4, 6, 8, 10, 12, 14 anos). Em caso de dúvida, entre em contato pelo WhatsApp.",
  },
  {
    q: "Qual o prazo de entrega?",
    a: "O envio é feito em até 5 dias úteis após a confirmação do pagamento. O prazo de entrega varia de 5 a 15 dias úteis dependendo da região. Você receberá o código de rastreamento assim que o pedido for postado.",
  },
  {
    q: "Quais as formas de pagamento aceitas?",
    a: "Aceitamos pagamento via Pix (com desconto de 5%), cartão de crédito (em até 3x sem juros) e boleto bancário. O pedido só é processado após confirmação do pagamento.",
  },
  {
    q: "As camisas são originais?",
    a: "Trabalhamos com camisas de qualidade tailandesa (importadas da Tailândia), que são réplicas de altíssima qualidade. As camisas nacionais premium são produzidas no Brasil. Todos os produtos passam por controle de qualidade rigoroso.",
  },
  {
    q: "Posso trocar se o tamanho não servir?",
    a: "Trocas são aceitas apenas em caso de defeito de fabricação ou envio de tamanho errado, com prazo de 7 dias após o recebimento. Trocas por preferência de tamanho são de responsabilidade do cliente. Consulte nossa página de Trocas e Devoluções para mais detalhes.",
  },
  {
    q: "Vocês entregam para todo o Brasil?",
    a: "Sim! Entregamos para todas as regiões do Brasil com frete fixo. Confira nossa tabela de frete na página de Política de Frete.",
  },
  {
    q: "Como entro em contato com vocês?",
    a: "Nosso atendimento funciona das 10h às 18h pelo WhatsApp. Você também pode enviar um e-mail para contato@penabola.com ou usar o formulário na página Sobre.",
  },
];

const FAQ = () => {
  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="font-heading text-4xl text-foreground">PERGUNTAS FREQUENTES</h1>
        </div>

        <Accordion type="single" collapsible className="mt-8 space-y-3">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-lg border border-border bg-card px-6"
            >
              <AccordionTrigger className="text-left font-body text-sm font-medium text-foreground hover:text-primary">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </Layout>
  );
};

export default FAQ;
