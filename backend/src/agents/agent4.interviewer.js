const { PrismaClient } = require('@prisma/client');
const { chat } = require('../services/groq.service');
const { signInterviewToken } = require('../services/token.service');
const { setInterviewToken } = require('../services/redis.service');
const { sendInterviewEmail } = require('../services/email.service');
const { emitCandidateUpdate } = require('../sockets/dashboard.socket');
const PROMPTS = require('./prompts');

const prisma = new PrismaClient();

const run = async ({ candidateId }) => {
  console.log(`🤖 Agent 4 - Setting up interview for candidate ${candidateId}`);

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { job: true },
  });

  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  // Generate interview questions
  const userMessage = `JOB TITLE: ${candidate.job.title}\nREQUIREMENTS: ${candidate.job.requirements}`;
  
  let questions = [];
  try {
    const raw = await chat(PROMPTS.INTERVIEW_QUESTIONS, userMessage, true);
    const result = JSON.parse(raw);
    questions = result.questions;
  } catch (err) {
    questions = [
      { id: 1, question: 'Tell me about yourself and your background.', purpose: 'general background' },
      { id: 2, question: 'Why are you interested in this role?', purpose: 'motivation' },
      { id: 3, question: 'Describe a challenge you overcame at work.', purpose: 'problem solving' },
      { id: 4, question: 'What are your key strengths for this position?', purpose: 'self-awareness' },
    ];
  }

  // Create signed interview token
  const token = signInterviewToken(candidateId, candidate.jobId);
  await setInterviewToken(token, candidateId, 86400); // 24h TTL

  // Save token + questions
  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      interviewToken: token,
      stage: 'INTERVIEW',
      interviewNotes: JSON.stringify(questions),
    },
  });

  // Send email
  try {
    await sendInterviewEmail(candidate.email, candidate.name, candidate.job.title, token);
  } catch (err) {
    console.error('Interview email error:', err.message);
  }

  emitCandidateUpdate(candidate.job.tenantId, {
    candidateId,
    stage: 'INTERVIEW',
    interviewToken: token,
  });

  console.log(`✅ Agent 4 - Interview token created for ${candidate.name}`);
};

module.exports = { run };
