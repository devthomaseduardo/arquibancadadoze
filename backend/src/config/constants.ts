// Status e opções usados em todo o backend

export const PAYMENT_STATUS = {
  PENDING: "pendente",
  APPROVED: "aprovado",
  REFUNDED: "estornado",
} as const;

export const ORDER_STATUS = {
  AWAITING: "aguardando",
  PICKING: "em_separacao",
  SHIPPED: "enviado",
  DELIVERED: "entregue",
  RETURNED: "trocado_devolvido",
} as const;

export const PAYMENT_METHODS = {
  CREDIT_CARD: "cartao",
  BOLETO: "boleto",
  PIX: "pix",
} as const;

export const RETURN_STATUS = {
  REQUESTED: "solicitado",
  APPROVED: "aprovado",
  IN_TRANSIT: "em_transito",
  COMPLETED: "concluido",
  REFUSED: "recusado",
} as const;

export const RETURN_REASONS = {
  DEFECT: "defeito_fabricacao",
  WRONG_SIZE: "tamanho_errado",
  OTHER: "outro",
} as const;

export const BRAZIL_REGIONS = [
  "Sudeste",
  "Sul",
  "Nordeste",
  "Norte",
  "Centro-Oeste",
] as const;
