const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const { signToken } = require('../services/token.service');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// Register company + first admin user
router.post('/register', async (req, res) => {
  try {
    const { companyName, companyEmail, userName, email, password } = req.body;
    if (!companyName || !email || !password || !userName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 12);

    const result = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: { name: companyName, email: companyEmail || email }
      });
      const user = await tx.user.create({
        data: { name: userName, email, password: hashed, role: 'ADMIN', tenantId: tenant.id }
      });
      return { tenant, user };
    });

    const token = signToken({ userId: result.user.id, tenantId: result.tenant.id, role: result.user.role });
    res.status(201).json({ token, user: { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role }, tenantId: result.tenant.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { tenant: true } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = signToken({ userId: user.id, tenantId: user.tenantId, role: user.role });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role }, tenantId: user.tenantId, companyName: user.tenant.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { tenant: true },
      select: { id: true, name: true, email: true, role: true, tenant: { select: { name: true } } }
    });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
