
import React from "react";
import Layout from "../components/Layout";
import { Truck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getShippingPolicies } from "../lib/api";

const ShippingPolicy = () => {
  const { data = [], isLoading, isError } = useQuery({ 
    queryKey: ["shipping-policies"], 
    queryFn: getShippingPolicies 
  });

  return (
    <Layout>
      <div className="container mx-auto max-w-3xl px-4 py-12">
        <div className="flex items-center gap-3">
          <Truck className="h-8 w-8 text-primary" />
          <h1 className="font-heading text-4xl text-white uppercase tracking-tight">Política de Frete</h1>
        </div>

        <div className="mt-8 space-y-6">
          <p className="text-zinc-400 text-lg">
            Na <span className="text-white font-bold">Arquibancada 12</span>, trabalhamos com transparência. 
            Nossas camisas premium são enviadas com seguro e rastreamento total. Confira os valores fixos por região:
          </p>

          {isLoading ? (
            <div className="py-10 text-center text-zinc-500">Carregando tabela de frete...</div>
          ) : isError ? (
            <div className="py-10 text-center text-red-500">Erro ao carregar políticas de frete.</div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/30">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary">Região</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-primary">Estados</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-widest text-primary">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {data.map((row: any) => (
                    <tr key={row.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-white">{row.region}</td>
                      <td className="px-6 py-4 text-sm text-zinc-400">{row.description}</td>
                      <td className="px-6 py-4 text-right text-sm font-bold text-white">
                        R$ {row.price.toFixed(2).replace(".", ",")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/30 p-8 space-y-4">
            <h3 className="font-heading text-xl text-white">Informações Importantes</h3>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-zinc-200">Prazo de Postagem:</strong> Até 5 dias úteis após a confirmação do pagamento.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-zinc-200">Prazo de Entrega:</strong> Entre 10 a 20 dias úteis para a maioria das capitais.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-zinc-200">Rastreamento:</strong> O código será enviado via WhatsApp e E-mail assim que disponível.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span><strong className="text-zinc-200">Frete Grátis:</strong> Válido para todo o Brasil em compras acima de R$ 350,00.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPolicy;
