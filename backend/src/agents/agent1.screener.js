const { PrismaClient } = require('@prisma/client');
const { chat } = require('../services/groq.service');
const { publish } = require('../kafka/producer');
const { setStage } = require('../services/redis.service');
const { decryptFile } = require('../services/crypto.service');
const { emitCandidateUpdate } = require('../sockets/dashboard.socket');
const TOPICS = require('../kafka/topics');
const PROMPTS = require('./prompts');
const pdfParse = require('pdf-parse');

const prisma = new PrismaClient();

const run = async ({ candidateId }) => {
  console.log(`🤖 Agent 1 - Screening candidate ${candidateId}`);

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { job: true },
  });

  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  // Update stage to SCREENING
  await prisma.candidate.update({ where: { id: candidateId }, data: { stage: 'SCREENING' } });
  await setStage(candidate.job.tenantId, candidateId, 'SCREENING');
  emitCandidateUpdate(candidate.job.tenantId, { candidateId, stage: 'SCREENING' });

  // Read and decrypt resume
  let resumeText = 'Resume text unavailable';
  try {
    const resumeBuffer = decryptFile(candidate.resumePath);
    const pdfData = await pdfParse(resumeBuffer);
    resumeText = pdfData.text;
  } catch (err) {
    console.warn('Could not parse resume PDF, using placeholder:', err.message);
  }

  // Call Groq AI
  const userMessage = `
JOB TITLE: ${candidate.job.title}
JOB DESCRIPTION: ${candidate.job.description}
REQUIREMENTS: ${candidate.job.requirements}

CANDIDATE RESUME:
${resumeText.slice(0, 3000)}
`;

  let result;
  try {
    const raw = await chat(PROMPTS.RESUME_SCREENER, userMessage, true);
    result = JSON.parse(raw);
  } catch (err) {
    console.error('Groq parse error:', err.message);
    result = { score: 0, qualified: false, reasoning: 'Error processing resume', strengths: [], concerns: ['Processing error'] };
  }

  console.log(`📊 Agent 1 result: score=${result.score}, qualified=${result.qualified}`);

  // Save result
  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      screeningScore: result.score,
      screeningNotes: JSON.stringify(result),
      stage: result.qualified ? 'ASSESSMENT' : 'SCREENED_OUT',
    },
  });

  const newStage = result.qualified ? 'ASSESSMENT' : 'SCREENED_OUT';
  await setStage(candidate.job.tenantId, candidateId, newStage);
  emitCandidateUpdate(candidate.job.tenantId, {
    candidateId,
    stage: newStage,
    screeningScore: result.score,
  });

  // Pass to Agent 2 if qualified
  if (result.qualified) {
    await publish(TOPICS.SCREENING_PASSED, { candidateId });
  }
};

module.exports = { run };
