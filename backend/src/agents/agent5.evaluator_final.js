const { PrismaClient } = require('@prisma/client');
const { chat } = require('../services/groq.service');
const { publish } = require('../kafka/producer');
const { setStage } = require('../services/redis.service');
const { emitCandidateUpdate } = require('../sockets/dashboard.socket');
const TOPICS = require('../kafka/topics');
const PROMPTS = require('./prompts');

const prisma = new PrismaClient();

const run = async ({ candidateId }) => {
  console.log(`🤖 Agent 5 - Evaluating interview and generating final score for candidate ${candidateId}`);

  const candidate = await prisma.candidate.findUnique({
    where: { id: candidateId },
    include: { 
      job: true, 
      assessment: true, 
      evaluation: true,
    },
  });

  if (!candidate) throw new Error(`Candidate ${candidateId} not found`);

  await prisma.candidate.update({ 
    where: { id: candidateId }, 
    data: { stage: 'FINAL_REVIEW' } 
  });
  emitCandidateUpdate(candidate.job.tenantId, { candidateId, stage: 'FINAL_REVIEW' });

  // Parse interview answers
  let interviewAnswers = [];
  try {
    if (candidate.interviewNotes) {
      interviewAnswers = JSON.parse(candidate.interviewNotes);
    }
  } catch (e) {
    console.error('Error parsing interview notes:', e.message);
  }

  // Get interview questions
  let interviewQuestions = [];
  try {
    if (candidate.interviewNotes) {
      // interviewNotes contains the answers as strings array
      // We need to get questions from somewhere - they're stored when interview is created
      // For now, we'll reconstruct from what we have
    }
  } catch (e) {}

  // Evaluate interview responses
  let interviewReviewResult = {
    score: 50,
    summary: 'Interview evaluation completed',
    strengths: [],
    weaknesses: [],
    communicationScore: 50,
    technicalScore: 50,
    professionalism: 50,
  };

  try {
    const answersText = Array.isArray(interviewAnswers) 
      ? interviewAnswers.map((a, i) => `Q${i+1}: ${a}`).join('\n\n')
      : String(interviewAnswers);

    const userMessage = `
JOB TITLE: ${candidate.job.title}
REQUIREMENTS: ${candidate.job.requirements}

INTERVIEW RESPONSES:
${answersText}
`;

    const raw = await chat(PROMPTS.INTERVIEW_EVALUATOR, userMessage, true);
    interviewReviewResult = JSON.parse(raw);
  } catch (err) {
    console.error('Agent 5 interview evaluation error:', err.message);
  }

  // Save interview review
  await prisma.interviewReview.create({
    data: {
      score: interviewReviewResult.score,
      summary: interviewReviewResult.summary,
      strengths: interviewReviewResult.strengths || [],
      weaknesses: interviewReviewResult.weaknesses || [],
      answers: interviewAnswers,
      candidateId,
    },
  });

  // Calculate final score based on all stages
  const screeningScore = candidate.screeningScore || 0;
  const assessmentScore = candidate.evaluation?.totalScore || 0;
  const interviewScore = interviewReviewResult.score || 0;

  let finalScore = (screeningScore * 0.3 + assessmentScore * 0.3 + interviewScore * 0.4);
  let recommendation = 'CONSIDER';

  if (finalScore >= 80) {
    recommendation = 'STRONG_HIRE';
  } else if (finalScore >= 65) {
    recommendation = 'HIRE';
  }

  try {
    const finalEvalPrompt = `
RESUME SCREENING SCORE: ${Math.round(screeningScore)}/100
SKILLS ASSESSMENT SCORE: ${Math.round(assessmentScore)}/100
INTERVIEW SCORE: ${Math.round(interviewScore)}/100

CANDIDATE STRENGTHS:
- Screening: ${(candidate.screeningNotes ? JSON.parse(candidate.screeningNotes).strengths?.slice(0,2).join(', ') : 'N/A')}
- Assessment: ${(candidate.evaluation?.strengths?.slice(0,2).join(', ') || 'N/A')}
- Interview: ${(interviewReviewResult.strengths?.slice(0,2).join(', ') || 'N/A')}

Generate a final comprehensive evaluation.
JOB: ${candidate.job.title}`;

    const finalRaw = await chat(PROMPTS.FINAL_EVALUATOR, finalEvalPrompt, true);
    const finalEval = JSON.parse(finalRaw);
    finalScore = finalEval.finalScore;
    recommendation = finalEval.recommendation;
  } catch (err) {
    console.error('Final evaluation error:', err.message);
  }

  // Update candidate with final score
  await prisma.candidate.update({
    where: { id: candidateId },
    data: {
      finalScore: Math.round(finalScore),
      stage: 'FINAL_REVIEW',
      interviewScore: interviewReviewResult.score,
    },
  });

  emitCandidateUpdate(candidate.job.tenantId, {
    candidateId,
    stage: 'FINAL_REVIEW',
    finalScore: Math.round(finalScore),
    interviewScore: interviewReviewResult.score,
    recommendation,
  });

  console.log(`✅ Agent 5 - Final Score: ${Math.round(finalScore)}, Recommendation: ${recommendation}`);
};

module.exports = { run };
