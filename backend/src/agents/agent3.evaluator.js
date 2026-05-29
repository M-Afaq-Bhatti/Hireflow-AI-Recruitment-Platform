const { PrismaClient } = require('@prisma/client');
const { chat } = require('../services/groq.service');
const { publish } = require('../kafka/producer');
const { setStage } = require('../services/redis.service');
const { emitCandidateUpdate } = require('../sockets/dashboard.socket');
const TOPICS = require('../kafka/topics');
const PROMPTS = require('./prompts');

const prisma = new PrismaClient();

const run = async ({ candidateId }) => {
  console.log(`🤖 Agent 3 - Evaluating answers for candidate ${candidateId}`);

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { job: true, assessment: true },
  });

  if (!candidate || !candidate.assessment) throw new Error(`Candidate or assessment not found`);

  await prisma.candidate.update({ where: { id: candidateId }, data: { stage: 'EVALUATING' } });
  emitCandidateUpdate(candidate.job.tenantId, { candidateId, stage: 'EVALUATING' });

  const questionsAndAnswers = candidate.assessment.questions.map((q, i) => ({
    question: q.question,
    answer: candidate.assessment.answers[i]?.answer || 'No answer provided',
    maxScore: q.maxScore,
  }));

  const userMessage = `
JOB TITLE: ${candidate.job.title}
REQUIREMENTS: ${candidate.job.requirements}

QUESTIONS AND ANSWERS:
${questionsAndAnswers.map((qa, i) => `Q${i+1}: ${qa.question}\nA${i+1}: ${qa.answer}`).join('\n\n')}
`;

  let result;
  try {
    const raw = await chat(PROMPTS.ANSWER_EVALUATOR, userMessage, true);
    result = JSON.parse(raw);
  } catch (err) {
    console.error('Agent 3 error:', err.message);
    result = {
      scores: questionsAndAnswers.map((_, i) => ({ questionId: i+1, score: 10, feedback: 'Could not evaluate' })),
      totalScore: 50,
      summary: 'Automated evaluation unavailable.',
      strengths: [],
      weaknesses: [],
      recommendation: 'SHORTLIST',
    };
  }

  // Save evaluation
  await prisma.evaluation.create({
    data: {
      scores: result.scores,
      totalScore: result.totalScore,
      summary: result.summary,
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      candidateId,
    },
  });

  const shortlisted = result.recommendation === 'SHORTLIST' || result.totalScore >= 50;
  const newStage = shortlisted ? 'INTERVIEW' : 'REJECTED';

  await prisma.candidate.update({ where: { id: candidateId }, data: { stage: newStage } });
  await setStage(candidate.job.tenantId, candidateId, newStage);
  emitCandidateUpdate(candidate.job.tenantId, {
    candidateId,
    stage: newStage,
    evaluationScore: result.totalScore,
  });

  if (shortlisted) {
    await publish(TOPICS.INTERVIEW_INVITED, { candidateId });
  }

  console.log(`✅ Agent 3 - Score: ${result.totalScore}, Stage: ${newStage}`);
};

module.exports = { run };
