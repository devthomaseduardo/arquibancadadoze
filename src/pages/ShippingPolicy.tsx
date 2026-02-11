import Layout from "@/components/Layout";
import { Truck } from "lucide-react";

const shippingTable = [
  { region: "Sudeste", states: "SP, RJ, MG, ES", price: "R$ 30,00" },
  { region: "Sul", states: "PR, SC, RS", price: "R$ 35,00" },
  { region: "Centro-Oeste", states: "GO, MT, MS, DF", price: "R$ 40,00" },
  { region: "Nordeste", states: "BA, PE, CE, MA, PI, RN, PB, SE, AL", price: "R$ 45,00" },
  { region: "Norte", states: "AM, PA, AC, RO, RR, AP, TO", price: "R$ 45,00" },
];

const ShippingPolicy = () => {
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
              {shippingTable.map((row) => (
                <tr key={row.region} className="border-b border-border last:border-0">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{row.region}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{row.states}</td>
                  <td className="px-6 py-4 text-right text-sm font-semibold text-primary">{row.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-6 text-sm text-foreground/80">
          <h3 className="font-heading text-lg text-foreground">INFORMAÇÕES ADICIONAIS</h3>
          <ul className="mt-3 space-y-2">
            <li>📦 Prazo de envio: até 5 dias úteis após confirmação do pagamento</li>
            <li>📬 Prazo de entrega: 5 a 15 dias úteis, dependendo da região</li>
            <li>🔍 Código de rastreamento enviado por WhatsApp ou e-mail</li>
            <li>💰 Frete grátis para compras acima de R$ 500,00</li>
            <li>🏍️ SEDEX sob consulta</li>
            <li>🚗 Retirada via Uber Flash disponível</li>
            <li>🏷️ Cliente pode gerar própria etiqueta</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;
