const { PrismaClient } = require('@prisma/client');
const { chat } = require('../services/groq.service');
const { publish } = require('../kafka/producer');
const { setStage } = require('../services/redis.service');
const { sendAssessmentEmail } = require('../services/email.service');
const { emitCandidateUpdate } = require('../sockets/dashboard.socket');
const TOPICS = require('../kafka/topics');
const PROMPTS = require('./prompts');

const prisma = new PrismaClient();

const run = async ({ candidateId }) => {
  console.log(`🤖 Agent 2 - Generating assessment for candidate ${candidateId}`);

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { job: true },
  });

  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  // Generate questions with Groq
  const userMessage = `
JOB TITLE: ${candidate.job.title}
JOB DESCRIPTION: ${candidate.job.description}
REQUIREMENTS: ${candidate.job.requirements}
CANDIDATE NAME: ${candidate.name}
`;

  let result;
  try {
    const raw = await chat(PROMPTS.ASSESSMENT_GENERATOR, userMessage, true);
    result = JSON.parse(raw);
  } catch (err) {
    console.error('Agent 2 error:', err.message);
    result = {
      questions: [
        { id: 1, question: 'Describe your most relevant experience for this role.', type: 'text', maxScore: 20 },
        { id: 2, question: 'What is your greatest technical strength?', type: 'text', maxScore: 20 },
        { id: 3, question: 'Describe a challenging project you completed.', type: 'text', maxScore: 20 },
        { id: 4, question: 'How do you handle tight deadlines?', type: 'text', maxScore: 20 },
        { id: 5, question: 'Where do you see yourself in 3 years?', type: 'text', maxScore: 20 },
      ]
    };
  }

  // Save assessment
  const assessment = await prisma.assessment.create({
    data: {
      questions: result.questions,
      candidateId,
    },
  });

  // Send email
  try {
    await sendAssessmentEmail(candidate.email, candidate.name, candidate.job.title, assessment.token);
  } catch (err) {
    console.error('Email send error:', err.message);
  }

  // Update stage
  await prisma.candidate.update({ where: { id: candidateId }, data: { stage: 'ASSESSMENT' } });
  await setStage(candidate.job.tenantId, candidateId, 'ASSESSMENT');
  emitCandidateUpdate(candidate.job.tenantId, { candidateId, stage: 'ASSESSMENT', assessmentToken: assessment.token });

  console.log(`✅ Agent 2 - Assessment created, token: ${assessment.token}`);
};

module.exports = { run };
