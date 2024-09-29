const Groq = require("./lib/groq-sdk");


async function queryAnswerStream(messages = [], model = "llama-3.2-11b-vision-preview", apiKey = process.env.GROQ_API_KEY) {
  const groq = new Groq({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  console.log('messages', messages, model, apiKey)
  return await groq.chat.completions
    .create({
      messages,
      model,
      stream: true,
    })
}

module.exports = {
  queryAnswerStream
}