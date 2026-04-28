const { PrismaClient } = require("@prisma/client");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();

// Resolve the Staff Lead ID (Staff Lead's own ID, or Staff's Lead ID)
const resolveLeadId = (user) => {
  if (user.role === "STAFF_LEAD") return user.id;
  if (user.role === "STAFF") return user.staffLeadId;
  return null;
};

// GET /api/products
const getProducts = async (req, res) => {
  try {
    const staffLeadId = resolveLeadId(req.user);
    if (!staffLeadId) return res.status(403).json({ message: "Not assigned to a staff lead" });

    const { search, category, page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      staffLeadId,
      ...(search && {
        OR: [
          { name: { contains: search } },
          { sku: { contains: search } },
          { description: { contains: search } },
        ],
      }),
      ...(category && { category }),
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: { updatedAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.product.count({ where }),
    ]);

    res.json({ products, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const staffLeadId = resolveLeadId(req.user);
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, staffLeadId },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/products (Staff Lead only)
const createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, sku, description, quantity, price, category } = req.body;

  try {
    const existing = await prisma.product.findUnique({ where: { sku } });
    if (existing) return res.status(400).json({ message: "SKU already exists" });

    const product = await prisma.product.create({
      data: {
        name,
        sku,
        description,
        quantity: parseInt(quantity) || 0,
        price: parseFloat(price),
        category,
        staffLeadId: req.user.id,
      },
    });

    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const staffLeadId = resolveLeadId(req.user);
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, staffLeadId },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    const { name, sku, description, quantity, price, category } = req.body;

    // Check SKU uniqueness if being changed
    if (sku && sku !== product.sku) {
      const skuExists = await prisma.product.findUnique({ where: { sku } });
      if (skuExists) return res.status(400).json({ message: "SKU already exists" });
    }

    // Staff can only update quantity
    const updateData =
      req.user.role === "STAFF"
        ? { quantity: parseInt(quantity) }
        : {
            ...(name && { name }),
            ...(sku && { sku }),
            ...(description !== undefined && { description }),
            ...(quantity !== undefined && { quantity: parseInt(quantity) }),
            ...(price !== undefined && { price: parseFloat(price) }),
            ...(category !== undefined && { category }),
          };

    const updated = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/products/:id (Staff Lead only)
const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findFirst({
      where: { id: req.params.id, staffLeadId: req.user.id },
    });

    if (!product) return res.status(404).json({ message: "Product not found" });

    await prisma.product.delete({ where: { id: req.params.id } });
    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };
