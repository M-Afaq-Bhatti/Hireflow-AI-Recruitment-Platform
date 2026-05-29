const nodemailer = require('nodemailer');

const getTransporter = () => {
  // In dev without email config, use Ethereal (catches emails, shows in console)
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER === 'your_email@gmail.com') {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: { user: 'test@ethereal.email', pass: 'test' }
    });
  }
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
};

const sendAssessmentEmail = async (candidateEmail, candidateName, jobTitle, assessmentToken) => {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/assessment/${assessmentToken}`;
  
  const info = await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'HireFlow <noreply@hireflow.ai>',
    to: candidateEmail,
    subject: `Your Assessment for ${jobTitle} — HireFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;">
        <h2 style="color:#1a1a2e;">Hi ${candidateName},</h2>
        <p>Congratulations! You've passed the initial screening for <strong>${jobTitle}</strong>.</p>
        <p>Please complete the following skills assessment within <strong>48 hours</strong>:</p>
        <a href="${link}" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
          Start Assessment →
        </a>
        <p style="color:#666;font-size:13px;">If the button doesn't work, copy this link: ${link}</p>
        <p style="color:#999;font-size:12px;">— The HireFlow Team</p>
      </div>
    `,
  });

  console.log(`📧 Assessment email sent to ${candidateEmail}. Preview: ${nodemailer.getTestMessageUrl(info) || 'sent'}`);
};

const sendInterviewEmail = async (candidateEmail, candidateName, jobTitle, interviewToken) => {
  const link = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/interview/${interviewToken}`;
  
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'HireFlow <noreply@hireflow.ai>',
    to: candidateEmail,
    subject: `Interview Invitation for ${jobTitle} — HireFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;">
        <h2 style="color:#1a1a2e;">Hi ${candidateName},</h2>
        <p>Excellent work on your assessment! You've been shortlisted for an AI interview for <strong>${jobTitle}</strong>.</p>
        <p>Click below to start your interview (link valid for 24 hours):</p>
        <a href="${link}" style="display:inline-block;background:#059669;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;margin:16px 0;">
          Start Interview →
        </a>
        <p style="color:#666;font-size:13px;">The interview takes about 10 minutes. Find a quiet place and allow microphone access.</p>
        <p style="color:#999;font-size:12px;">— The HireFlow Team</p>
      </div>
    `,
  });
  console.log(`📧 Interview email sent to ${candidateEmail}`);
};

module.exports = { sendAssessmentEmail, sendInterviewEmail };
