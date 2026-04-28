const router = require("express").Router();
const { body } = require("express-validator");
const { authenticate, requireRole } = require("../middleware/auth");
const { getMembers, getAvailableStaff, assignStaff, removeStaff } = require("../controllers/teamController");

router.use(authenticate, requireRole("STAFF_LEAD"));

router.get("/members", getMembers);
router.get("/available-staff", getAvailableStaff);

router.post(
  "/assign",
  [
    body("name").trim().notEmpty().withMessage("Name required"),
    body("email").isEmail().withMessage("Valid email required"),
    body("password").isLength({ min: 6 }).withMessage("Password min 6 characters"),
  ],
  assignStaff
);

router.delete("/remove/:staffId", removeStaff);

module.exports = router;
