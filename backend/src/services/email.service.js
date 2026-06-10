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

const sendHireEmail = async (candidateEmail, candidateName, jobTitle, salaryMin, salaryMax) => {
  const salaryRange = (salaryMin && salaryMax) 
    ? `${salaryMin.toLocaleString()}-${salaryMax.toLocaleString()}` 
    : 'Competitive';
  
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'HireFlow <noreply@hireflow.ai>',
    to: candidateEmail,
    subject: `🎉 Job Offer: ${jobTitle} — HireFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;background:#f0fdf4;border-radius:12px;">
        <h2 style="color:#059669;margin-top:0;">🎉 Congratulations ${candidateName}!</h2>
        <p style="font-size:16px;color:#1a1a2e;">We're thrilled to offer you the position of <strong>${jobTitle}</strong>.</p>
        
        <div style="background:white;border-left:4px solid #059669;padding:16px;margin:20px 0;border-radius:4px;">
          <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:1px;">Position Details</p>
          <p style="margin:8px 0;font-size:14px;color:#1a1a2e;"><strong>${jobTitle}</strong></p>
          <p style="margin:8px 0;font-size:13px;color:#666;">💰 Salary: ${salaryRange}/year</p>
        </div>

        <p style="color:#666;">Our HR team will reach out shortly with the next steps. We're excited to have you join the team!</p>
        
        <p style="margin-top:32px;color:#999;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px;">
          — The HireFlow Team<br/>
          This is an automated message. Please don't reply to this email.
        </p>
      </div>
    `,
  });
  console.log(`📧 Hire confirmation email sent to ${candidateEmail}`);
};

const sendRejectEmail = async (candidateEmail, candidateName, jobTitle) => {
  await getTransporter().sendMail({
    from: process.env.EMAIL_FROM || 'HireFlow <noreply@hireflow.ai>',
    to: candidateEmail,
    subject: `Update on Your Application for ${jobTitle} — HireFlow`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:32px;">
        <h2 style="color:#1a1a2e;">Hi ${candidateName},</h2>
        
        <p>Thank you for applying for the <strong>${jobTitle}</strong> position at our company. We appreciate the time and effort you put into the application and interview process.</p>
        
        <p>After careful consideration, we've decided to move forward with other candidates whose experience more closely aligns with our current needs. This doesn't diminish the value of your qualifications — it simply reflects the specific requirements of this position.</p>
        
        <p style="margin-top:24px;">We encourage you to stay connected with us! You may be a great fit for future opportunities.</p>
        
        <p style="margin-top:32px;color:#999;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px;">
          Best of luck in your career!<br/>
          — The HireFlow Team
        </p>
      </div>
    `,
  });
  console.log(`📧 Rejection email sent to ${candidateEmail}`);
};

module.exports = { sendAssessmentEmail, sendInterviewEmail, sendHireEmail, sendRejectEmail };
