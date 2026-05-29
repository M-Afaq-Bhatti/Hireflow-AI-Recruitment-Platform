const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { publish } = require('../kafka/producer');
const TOPICS = require('../kafka/topics');

const router = express.Router();
const prisma = new PrismaClient();

// Public: Get assessment by token (candidate visits link)
router.get('/:token', async (req, res) => {
  try {
    const assessment = await prisma.assessment.findUnique({
      where: { token: req.params.token },
      include: { candidate: { select: { name: true, job: { select: { title: true } } } } },
    });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (assessment.submitted) return res.status(410).json({ error: 'Assessment already submitted' });

    res.json({
      token: assessment.token,
      questions: assessment.questions,
      candidateName: assessment.candidate.name,
      jobTitle: assessment.candidate.job.title,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public: Submit assessment answers
router.post('/:token/submit', async (req, res) => {
  try {
    const { answers } = req.body;
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    const assessment = await prisma.assessment.findUnique({ where: { token: req.params.token } });
    if (!assessment) return res.status(404).json({ error: 'Assessment not found' });
    if (assessment.submitted) return res.status(410).json({ error: 'Already submitted' });

    await prisma.assessment.update({
      where: { token: req.params.token },
      data: { answers, submitted: true, submittedAt: new Date() },
    });

    // Trigger Agent 3
    await publish(TOPICS.ASSESSMENT_SUBMITTED, { candidateId: assessment.candidateId });

    res.json({ message: 'Assessment submitted! We will review your answers and be in touch.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
