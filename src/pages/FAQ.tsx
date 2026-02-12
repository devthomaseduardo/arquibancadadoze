import Layout from "@/components/Layout";
import { HelpCircle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFaq } from "@/lib/api";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const { data = [], isLoading, isError } = useQuery({ queryKey: ["faq"], queryFn: getFaq });

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-primary" />
          <h1 className="font-heading text-4xl text-foreground">PERGUNTAS FREQUENTES</h1>
        </div>

        {isLoading && <p className="mt-8 text-sm text-muted-foreground">Carregando FAQ...</p>}
        {isError && <p className="mt-8 text-sm text-destructive">Não foi possível carregar o FAQ.</p>}

        {!isLoading && !isError && (
          <Accordion type="single" collapsible className="mt-8 space-y-3">
            {data.map((faq) => (
              <AccordionItem
                key={faq.id}
                value={faq.id}
                className="rounded-lg border border-border bg-card px-6"
              >
                <AccordionTrigger className="text-left font-body text-sm font-medium text-foreground hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </div>
    </Layout>
  );
};

export default FAQ;
