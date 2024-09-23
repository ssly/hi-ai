const OpenAI = require("./lib/openai");

// const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o-mini";

async function queryAnswer(question, model = modelName) {
  // 从 utools 中获取 token
  const dbData = (await utools.db.get("githubToken")) || {};
  console.log("dbData", dbData);
  const token = dbData.data || "";
  const client = new OpenAI({
    baseURL: endpoint,
    apiKey: token,
    dangerouslyAllowBrowser: true, // 添加这一行
  });
  console.log("question", question, model, client.chat);
  const response = await client.chat.completions.create({
    // messages: [
    //   // { role: "system", content: "You are a helpful assistant." },
    //   { role: "user", content: question }
    // ],
    messages: question,
    model,
    temperature: 1.0,
    max_tokens: 1000,
    top_p: 1.0,
  });

  console.log(response.choices);
  return {
    model,
    stream: false,
    role: "assistant",
    content: response.choices[0].message.content,
  };
}

// queryAnswer("中国的首都是哪里？").catch((err) => {
//   console.error("The sample encountered an error:", err);
// });

module.exports = {
  queryAnswer,
};
