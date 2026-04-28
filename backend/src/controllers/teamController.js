const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");

const prisma = new PrismaClient();
const MAX_STAFF = 5;

// GET /api/team/members — Staff Lead sees their team
const getMembers = async (req, res) => {
  try {
    const members = await prisma.user.findMany({
      where: { staffLeadId: req.user.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    res.json({ members, count: members.length, maxAllowed: MAX_STAFF });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/team/available-staff — unassigned STAFF users
const getAvailableStaff = async (req, res) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: "STAFF", staffLeadId: null },
      select: { id: true, name: true, email: true },
      orderBy: { name: "asc" },
    });
    res.json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/team/assign — create & assign a new staff member
const assignStaff = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    // Check team capacity
    const currentCount = await prisma.user.count({
      where: { staffLeadId: req.user.id },
    });

    if (currentCount >= MAX_STAFF) {
      return res.status(400).json({ message: `Team is full. Maximum ${MAX_STAFF} staff allowed.` });
    }

    const { name, email, password } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);

    const staff = await prisma.user.create({
      data: {
        name,
        email,
        password: hashed,
        role: "STAFF",
        staffLeadId: req.user.id,
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.status(201).json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/team/remove/:staffId
const removeStaff = async (req, res) => {
  try {
    const staff = await prisma.user.findFirst({
      where: { id: req.params.staffId, staffLeadId: req.user.id },
    });

    if (!staff) return res.status(404).json({ message: "Staff member not found in your team" });

    // Unassign instead of deleting (preserve user account)
    await prisma.user.update({
      where: { id: req.params.staffId },
      data: { staffLeadId: null },
    });

    res.json({ message: "Staff removed from team" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getMembers, getAvailableStaff, assignStaff, removeStaff };
