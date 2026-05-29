const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { requireAuth, requireAdmin } = require('../middleware/auth.middleware');

const router = express.Router();
const prisma = new PrismaClient();

// Get tenant stats
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const tenantId = req.user.tenantId;
    const [totalJobs, totalCandidates, byStage] = await Promise.all([
      prisma.job.count({ where: { tenantId } }),
      prisma.candidate.count({ where: { job: { tenantId } } }),
      prisma.candidate.groupBy({
        by: ['stage'],
        where: { job: { tenantId } },
        _count: { stage: true },
      }),
    ]);

    const stageMap = {};
    byStage.forEach(s => { stageMap[s.stage] = s._count.stage; });

    res.json({ totalJobs, totalCandidates, byStage: stageMap });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
