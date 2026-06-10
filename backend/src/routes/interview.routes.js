const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { verifyToken } = require('../services/token.service');

const router = express.Router();
const prisma = new PrismaClient();

// Public: Validate interview token and get interview data
router.get('/:token', async (req, res) => {
  try {
    const decoded = verifyToken(req.params.token);
    if (decoded.type !== 'interview') return res.status(403).json({ error: 'Invalid interview token' });

    const candidate = await prisma.candidate.findUnique({
      where: { id: decoded.candidateId },
      include: { job: { select: { title: true, description: true } } },
    });
    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    let questions = [];
    if (candidate.interviewNotes) {
      try { questions = JSON.parse(candidate.interviewNotes); } catch (e) {}
    }

    res.json({
      candidateName: candidate.name,
      jobTitle: candidate.job.title,
      questions,
      token: req.params.token,
    });
  } catch (err) {
    if (err.name === 'TokenExpiredError') return res.status(410).json({ error: 'Interview link has expired' });
    res.status(500).json({ error: err.message });
  }
});

// Save interview result
router.post('/:token/complete', async (req, res) => {
  try {
    const decoded = verifyToken(req.params.token);
    const { notes, score } = req.body;

    const candidate = await prisma.candidate.findUnique({
      where: { id: decoded.candidateId },
      include: { job: true },
    });

    if (!candidate) return res.status(404).json({ error: 'Candidate not found' });

    // Save interview answers and trigger evaluation
    await prisma.candidate.update({
      where: { id: decoded.candidateId },
      data: { 
        stage: 'INTERVIEW_EVALUATING',
        interviewNotes: notes,
        interviewScore: score || null,
      },
    });

    // Publish to Kafka for Agent 5 (Interview Evaluator)
    const { publish } = require('../kafka/producer');
    const TOPICS = require('../kafka/topics');
    await publish(TOPICS.INTERVIEW_COMPLETED, { candidateId: decoded.candidateId });

    // Emit socket update
    const { emitCandidateUpdate } = require('../sockets/dashboard.socket');
    emitCandidateUpdate(candidate.job.tenantId, { 
      candidateId: decoded.candidateId, 
      stage: 'INTERVIEW_EVALUATING' 
    });

    res.json({ message: 'Interview completed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
