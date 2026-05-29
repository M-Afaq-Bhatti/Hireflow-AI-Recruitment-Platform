const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const chat = async (systemPrompt, userMessage, jsonMode = false) => {
  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ],
    temperature: 0.3,
    max_tokens: 2000,
    ...(jsonMode && { response_format: { type: 'json_object' } }),
  });
  return response.choices[0].message.content;
};

module.exports = { chat };
