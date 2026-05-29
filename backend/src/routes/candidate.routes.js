const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload.middleware');
const { publish } = require('../kafka/producer');
const { encryptFile } = require('../services/crypto.service');
const { emitNewCandidate } = require('../sockets/dashboard.socket');
const TOPICS = require('../kafka/topics');

const router = express.Router();
const prisma = new PrismaClient();

// Public: Apply for a job
router.post('/apply', upload.single('resume'), async (req, res) => {
  try {
    const { name, email, phone, jobId } = req.body;
    if (!name || !email || !jobId || !req.file) {
      return res.status(400).json({ error: 'Name, email, jobId, and resume PDF are required' });
    }

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Encrypt the resume
    try { encryptFile(req.file.path); } catch (e) { console.warn('Encryption failed:', e.message); }

    const candidate = await prisma.candidate.create({
      data: { name, email, phone, resumePath: req.file.path, jobId, stage: 'APPLIED' },
    });

    emitNewCandidate(job.tenantId, { candidateId: candidate.id, name, email, jobId, stage: 'APPLIED' });

    // Kick off Agent 1 via Kafka
    await publish(TOPICS.RESUME_SUBMITTED, { candidateId: candidate.id });

    res.status(201).json({ message: 'Application submitted successfully! We will review it shortly.', candidateId: candidate.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all candidates for tenant
router.get('/', requireAuth, async (req, res) => {
  try {
    const { jobId, stage } = req.query;
    const where = {
      job: { tenantId: req.user.tenantId },
      ...(jobId && { jobId }),
      ...(stage && { stage }),
    };
    const candidates = await prisma.candidate.findMany({
      where,
      include: { job: { select: { title: true } }, evaluation: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single candidate
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, job: { tenantId: req.user.tenantId } },
      include: { job: true, assessment: true, evaluation: true },
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    
    // Parse screeningNotes JSON
    if (candidate.screeningNotes) {
      try { candidate.screeningData = JSON.parse(candidate.screeningNotes); } catch (e) {}
    }
    res.json(candidate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update candidate stage manually (HR override)
router.patch('/:id/stage', requireAuth, async (req, res) => {
  try {
    const { stage } = req.body;
    const candidate = await prisma.candidate.findFirst({
      where: { id: req.params.id, job: { tenantId: req.user.tenantId } }
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });
    const updated = await prisma.candidate.update({ where: { id: req.params.id }, data: { stage } });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
