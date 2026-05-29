const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// IMPORTANT: Public routes MUST come before parameterized routes (:id)

// Public: get all active jobs (for candidates - no auth)
router.get('/public', async (req, res) => {
  try {
    console.log('📋 Fetching public jobs...');
    
    // First update all null isActive to true for backward compatibility
    try {
      await prisma.$executeRaw`UPDATE "Job" SET "isActive" = true WHERE "isActive" IS NULL`;
      console.log('✅ Updated null isActive values');
    } catch (e) {
      console.log('ℹ️ isActive migration already done or not needed');
    }

    // Get all jobs (now they should all have isActive = true)
    const jobs = await prisma.job.findMany({
      select: { 
        id: true, 
        title: true, 
        description: true, 
        requirements: true, 
        department: true, 
        location: true,
        salaryMin: true,
        salaryMax: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
    });
    
    console.log(`✅ Found ${jobs.length} total jobs`);
    if (jobs.length > 0) {
      console.log('First job:', jobs[0]);
    }
    
    res.json(jobs);
  } catch (err) {
    console.error('❌ Error fetching public jobs:', err.message);
    console.error('Stack:', err.stack);
    res.status(500).json({ error: err.message });
  }
});

// Public: get job by ID (for application form - no auth)
router.get('/public/:id', async (req, res) => {
  try {
    console.log(`📄 Fetching job: ${req.params.id}`);
    const job = await prisma.job.findUnique({
      where: { id: req.params.id },
      select: { 
        id: true, 
        title: true, 
        description: true, 
        requirements: true, 
        department: true, 
        location: true, 
        salaryMin: true, 
        salaryMax: true 
      }
    });
    if (!job) {
      console.log(`❌ Job not found: ${req.params.id}`);
      return res.status(404).json({ error: 'Job not found' });
    }
    console.log(`✅ Found job: ${job.title}`);
    res.json(job);
  } catch (err) {
    console.error('❌ Error fetching job:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get all jobs for tenant (AUTH REQUIRED)
router.get('/', requireAuth, async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      where: { tenantId: req.user.tenantId },
      include: { _count: { select: { candidates: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single job (AUTH REQUIRED)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findFirst({
      where: { id: req.params.id, tenantId: req.user.tenantId },
      include: {
        candidates: {
          include: { assessment: true, evaluation: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create job (AUTH REQUIRED)
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, requirements, department, location, salaryMin, salaryMax } = req.body;
    if (!title || !description || !requirements) {
      return res.status(400).json({ error: 'Title, description, and requirements are required' });
    }
    const job = await prisma.job.create({
      data: { 
        title, 
        description, 
        requirements, 
        department, 
        location, 
        salaryMin, 
        salaryMax, 
        isActive: true,
        tenantId: req.user.tenantId 
      },
    });
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update job (AUTH REQUIRED)
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    const updated = await prisma.job.update({ where: { id: req.params.id }, data: req.body });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete job (AUTH REQUIRED)
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const job = await prisma.job.findFirst({ where: { id: req.params.id, tenantId: req.user.tenantId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    await prisma.job.delete({ where: { id: req.params.id } });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
