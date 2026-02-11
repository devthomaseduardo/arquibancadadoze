export type PaymentStatus = "pendente" | "aprovado" | "estornado";
export type OrderStatus = "aguardando" | "em_separacao" | "enviado" | "entregue" | "trocado_devolvido";

export interface OrderItem {
  productName: string;
  size: string;
  color?: string;
  quantity: number;
  salePrice: number;
  cost: number;
}

export interface Order {
  id: string;
  date: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  shippingCharged: number;
  shippingCost: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  trackingCode?: string;
  notes?: string;
}

export const mockOrders: Order[] = [
  {
    id: "TU-001",
    date: "2026-02-10T14:30:00",
    customerName: "Carlos Silva",
    customerEmail: "carlos@email.com",
    customerPhone: "(11) 99999-1234",
    customerAddress: "Rua das Flores, 123 - São Paulo/SP - CEP 01234-567",
    items: [
      { productName: "Camisa Flamengo I 2024", size: "G", quantity: 1, salePrice: 179.90, cost: 80 },
      { productName: "Boné Flamengo Premium", size: "Único", quantity: 1, salePrice: 59.90, cost: 18 },
    ],
    shippingCharged: 30,
    shippingCost: 18,
    paymentMethod: "Pix",
    paymentStatus: "aprovado",
    orderStatus: "em_separacao",
    trackingCode: "BR123456789",
    notes: "Cliente pediu embalagem para presente.",
  },
  {
    id: "TU-002",
    date: "2026-02-09T10:15:00",
    customerName: "Ana Oliveira",
    customerEmail: "ana@email.com",
    customerPhone: "(21) 98888-5678",
    customerAddress: "Av. Brasil, 456 - Rio de Janeiro/RJ - CEP 20000-000",
    items: [
      { productName: "Camisa Brasil 1970 Retrô", size: "M", quantity: 2, salePrice: 259.90, cost: 130 },
    ],
    shippingCharged: 30,
    shippingCost: 20,
    paymentMethod: "Cartão",
    paymentStatus: "aprovado",
    orderStatus: "enviado",
    trackingCode: "BR987654321",
  },
  {
    id: "TU-003",
    date: "2026-02-08T16:45:00",
    customerName: "Pedro Santos",
    customerEmail: "pedro@email.com",
    customerPhone: "(31) 97777-9012",
    customerAddress: "Rua Minas Gerais, 789 - Belo Horizonte/MG - CEP 30000-000",
    items: [
      { productName: "Agasalho Manchester City", size: "GG", quantity: 1, salePrice: 349.90, cost: 250 },
    ],
    shippingCharged: 30,
    shippingCost: 22,
    paymentMethod: "Boleto",
    paymentStatus: "pendente",
    orderStatus: "aguardando",
  },
  {
    id: "TU-004",
    date: "2026-02-07T09:00:00",
    customerName: "Maria Costa",
    customerEmail: "maria@email.com",
    customerPhone: "(71) 96666-3456",
    customerAddress: "Rua Salvador, 321 - Salvador/BA - CEP 40000-000",
    items: [
      { productName: "Conjunto Infantil Flamengo", size: "8", quantity: 1, salePrice: 169.90, cost: 90 },
      { productName: "Camisa Corinthians I 2024", size: "P", quantity: 1, salePrice: 169.90, cost: 80 },
    ],
    shippingCharged: 45,
    shippingCost: 30,
    paymentMethod: "Pix",
    paymentStatus: "aprovado",
    orderStatus: "entregue",
  },
  {
    id: "TU-005",
    date: "2026-02-06T11:30:00",
    customerName: "João Ferreira",
    customerEmail: "joao@email.com",
    customerPhone: "(85) 95555-7890",
    customerAddress: "Rua Fortaleza, 654 - Fortaleza/CE - CEP 60000-000",
    items: [
      { productName: "Camisa PSG Jogador 2024", size: "M", quantity: 1, salePrice: 279.90, cost: 130 },
    ],
    shippingCharged: 45,
    shippingCost: 32,
    paymentMethod: "Cartão",
    paymentStatus: "estornado",
    orderStatus: "trocado_devolvido",
  },
];
