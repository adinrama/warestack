const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const leadPass = await bcrypt.hash("password123", 12);
  const staffPass = await bcrypt.hash("password123", 12);

  const lead = await prisma.user.upsert({
    where: { email: "lead@warehouse.com" },
    update: {},
    create: {
      name: "John Lead",
      email: "lead@warehouse.com",
      password: leadPass,
      role: "STAFF_LEAD",
    },
  });

  const staff1 = await prisma.user.upsert({
    where: { email: "staff1@warehouse.com" },
    update: {},
    create: {
      name: "Alice Staff",
      email: "staff1@warehouse.com",
      password: staffPass,
      role: "STAFF",
      staffLeadId: lead.id,
    },
  });

  // Seed products
  const products = [
    { name: "Industrial Drill Bit Set", sku: "TOOL-001", quantity: 50, price: 89.99, category: "Tools" },
    { name: "Safety Helmet Class E", sku: "PPE-001", quantity: 120, price: 24.99, category: "Safety" },
    { name: "Forklift Pallet Jack", sku: "EQUIP-001", quantity: 8, price: 1299.0, category: "Equipment" },
    { name: "Warehouse Shelving Unit 5-Tier", sku: "SHELF-001", quantity: 30, price: 199.99, category: "Storage" },
    { name: "Heavy Duty Work Gloves", sku: "PPE-002", quantity: 200, price: 12.5, category: "Safety" },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: { ...p, staffLeadId: lead.id },
    });
  }

  console.log("✅ Seed complete");
  console.log("📧 Staff Lead: lead@warehouse.com / password123");
  console.log("📧 Staff: staff1@warehouse.com / password123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
