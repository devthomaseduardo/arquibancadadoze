
import { PrismaClient } from "@prisma/client";
import { createOrder } from "../src/modules/orders/orders.service";
import * as productsService from "../src/modules/products/products.service";

const prisma = new PrismaClient();

async function main() {
    console.log("🧹 Limpando dados...");
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.influencer.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log("📦 Preparando ambiente...");
    const category = await prisma.category.create({
        data: { name: "Retro", slug: "retro", costMin: 10, costMax: 20 },
    });

    // Produto: Custo 50, Preço Sugerido 100
    // Margem Padrão = 20%
    const product = await productsService.createProduct({
        categoryId: category.id,
        name: "Camisa Brasil 94",
        slug: "brasil-94",
        costMin: 50,
        costMax: 50, // Custo fixo
        priceMin: 100,
        priceMax: 150,
        variants: [{ size: "G", quantity: 10 }]
    });

    // Influenciador Zico10 (10% comissão)
    await prisma.influencer.create({
        data: {
            name: "Zico",
            couponCode: "ZICO10",
            commissionRate: 10.0
        }
    });

    // Campanha Sazonal (Margem mínima exigida sobre para 30%)
    await prisma.campaign.create({
        data: {
            name: "Copa do Mundo",
            targetCategorySlug: "retro",
            active: true,
            startDate: new Date("2020-01-01"),
            endDate: new Date("2030-01-01"),
            minMarginOverride: 30.0
        }
    });

    console.log("✅ Ambiente pronto.");

    console.log("\n--- Cenário 1: Venda com Preço Baixo (Margem Ruim) ---");
    // Custo 50. Venda 70.
    // Taxa Plataforma 10% (7.00). Envio (0).
    // Total 70. Lucro = 70 - 50 - 7 = 13.
    // Margem = 13 / 70 = 18.5%
    // Mínimo exigido = 30% (Campanha).
    try {
        await createOrder({
            customerName: "Tester",
            customerEmail: "t@t.com",
            addressStreet: "Rua", addressNumber: "1", addressCity: "Rio", addressState: "RJ", addressZip: "00",
            paymentMethod: "pix",
            shippingCost: 0,
            paymentStatus: "approved",
            items: [{
                productId: product.id, productName: product.name, variation: "G", quantity: 1, unitPrice: 70
            }]
        });
        console.error("❌ FALHA: Deveria ter bloqueado por margem baixa!");
    } catch (e: any) {
        console.log("✅ SUCESSO: Bloqueado por margem:", e.message);
    }

    console.log("\n--- Cenário 2: Venda Saudável com Influenciador ---");
    // Preço 110. Cupom ZICO10.
    // Taxa Plat 10% (11.00).
    // Comissão 10% (11.00).
    // Custo 50.
    // Total 110. Lucro = 110 - 50 - 11 - 11 = 38.
    // Margem = 38 / 110 = 34.5% (> 30%). OK.
    const order = await createOrder({
        customerName: "Fã do Galinho",
        customerEmail: "zico@t.com",
        addressStreet: "Rua", addressNumber: "1", addressCity: "Rio", addressState: "RJ", addressZip: "00",
        paymentMethod: "pix",
        shippingCost: 0,
        couponCode: "ZICO10",
        items: [{
            productId: product.id, productName: product.name, variation: "G", quantity: 1, unitPrice: 110
        }]
    });

    if (order.netMarginPercent && order.netMarginPercent > 30) {
        console.log(`✅ Pedido Aprovado! Lucro: R$ ${order.netProfit?.toFixed(2)} (${order.netMarginPercent?.toFixed(1)}%)`);
        console.log(`   Comissão Zico: R$ ${order.commissionValue?.toFixed(2)}`);
    } else {
        console.error("❌ Algo errado no cálculo do pedido aprovado.");
    }

}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
