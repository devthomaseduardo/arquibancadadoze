import { z } from "zod";

export const createOrderSchema = z.object({
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().optional(),
  customerCpf: z.string().optional(),
  addressStreet: z.string().min(2),
  addressNumber: z.string().min(1),
  addressComplement: z.string().optional(),
  addressNeighborhood: z.string().optional(),
  addressCity: z.string().min(2),
  addressState: z.string().length(2),
  addressZip: z.string().min(8),
  paymentMethod: z.string().min(1),
  paymentStatus: z.string().optional(),
  orderStatus: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().optional(),
      productName: z.string().min(1),
      variation: z.string().optional(),
      sku: z.string().optional(),
      quantity: z.number().int().positive(),
      unitPrice: z.number().nonnegative(),
      unitCost: z.number().nonnegative().optional(),
      personalization: z.string().optional(), // número/nome na camisa
      itemNotes: z.string().optional(),
    })
  ).min(1),
  shippingCost: z.number().nonnegative(),
  shippingCostPaid: z.number().nonnegative().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
  externalId: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
