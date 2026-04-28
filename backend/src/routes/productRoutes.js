const router = require("express").Router();
const { body } = require("express-validator");
const { authenticate, requireRole } = require("../middleware/auth");
const {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const productValidation = [
  body("name").trim().notEmpty().withMessage("Product name required"),
  body("sku").trim().notEmpty().withMessage("SKU required"),
  body("price").isFloat({ min: 0 }).withMessage("Valid price required"),
  body("quantity").optional().isInt({ min: 0 }).withMessage("Quantity must be non-negative integer"),
];

const updateValidation = [
  body("quantity").optional().isInt({ min: 0 }).withMessage("Quantity must be non-negative integer"),
  body("price").optional().isFloat({ min: 0 }).withMessage("Valid price required"),
];

router.use(authenticate);

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", requireRole("STAFF_LEAD"), productValidation, createProduct);
router.put("/:id", updateValidation, updateProduct);
router.delete("/:id", requireRole("STAFF_LEAD"), deleteProduct);

module.exports = router;
