const OpenAI = require("openai"); 

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o-mini";


async function queryAnswer(question, model = modelName) {
  console.log('question', question);
  console.log('goood', OpenAI, client.chat)
  const client = new OpenAI.Configuration({ baseURL: endpoint, apiKey: token });
  const response = await client.chat.completions.create({
    // messages: [
    //   // { role: "system", content: "You are a helpful assistant." },
    //   { role: "user", content: question }
    // ],
    messages: question,
    model,
    temperature: 1.0,
    max_tokens: 1000,
    top_p: 1.0
  });

  console.log(response.choices);
  return {
    model: modelName,
    stream: false,
    role: 'assistant',
    content: response.choices[0].message.content
  };
}

// queryAnswer("中国的首都是哪里？").catch((err) => {
//   console.error("The sample encountered an error:", err);
// });

module.exports = {
  queryAnswer
}
