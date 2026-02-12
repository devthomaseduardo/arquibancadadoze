import Layout from "@/components/Layout";
import { Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getShippingPolicies } from "@/lib/api";

const ShippingPolicy = () => {
  const { data = [], isLoading, isError } = useQuery({ queryKey: ["shipping"], queryFn: getShippingPolicies });

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="font-heading text-4xl text-foreground">POLÍTICA DE FRETE</h1>
        </div>

        <p className="mt-6 text-foreground/80">
          Trabalhamos com <span className="font-semibold text-primary">frete fixo</span> para todo o Brasil.
          Confira os valores por região:
        </p>

        {isLoading && <p className="mt-6 text-sm text-muted-foreground">Carregando tabela de frete...</p>}
        {isError && <p className="mt-6 text-sm text-destructive">Não foi possível carregar a tabela de frete.</p>}

        {!isLoading && !isError && (
          <div className="mt-8 overflow-hidden rounded-lg border border-border">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/50">
                  <th className="px-6 py-3 text-left font-heading text-sm text-foreground">Região</th>
                  <th className="px-6 py-3 text-left font-heading text-sm text-foreground">Estados</th>
                  <th className="px-6 py-3 text-right font-heading text-sm text-primary">Valor</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row) => (
                  <tr key={row.id} className="border-b border-border last:border-0">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">{row.region}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{row.description || "-"}</td>
                    <td className="px-6 py-4 text-right text-sm font-semibold text-primary">
                      R$ {row.price.toFixed(2).replace(".", ",")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-sm text-foreground/80">
          <h3 className="font-heading text-lg text-foreground">INFORMAÇÕES ADICIONAIS</h3>
          <ul className="mt-3 space-y-2">
            <li>📦 Prazo de envio: até 5 dias úteis após confirmação do pagamento</li>
            <li>📬 Prazo de entrega: 5 a 15 dias úteis, dependendo da região</li>
            <li>🔍 Código de rastreamento enviado por WhatsApp ou e-mail</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;
