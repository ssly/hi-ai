const OpenAI = require("./lib/openai"); 

// const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o-mini";


async function queryAnswer(question, model = modelName) {
  // 从 utools 中获取 token
  const dbData = await utools.db.get('aiConfig') || {}
  console.log('dbData', dbData)
  const token = dbData.githubToken || ''
  const client = new OpenAI({
    baseURL: endpoint,
    apiKey: token,
    dangerouslyAllowBrowser: true // 添加这一行
  });
  console.log('question', question, model, client.chat);
  let response = null
  try {
    response = await client.chat.completions.create({
      // messages: [
      //   // { role: "system", content: "You are a helpful assistant." },
      //   { role: "user", content: question }
      // ],
      messages: question,
      model,
    })
  } catch (error) {
    console.error('Error:', error);
    return {
      model,
      stream: false,
      role: 'assistant',
      content: 'Error: ' + error.message,
      timestamp: Date.now(),
    };
  }

  console.log('response#####')
  console.log(response);
  console.log('response#####!!')
  return {
    model,
    stream: false,
    role: 'assistant',
    content: response.choices[0].message.content,
    timestamp: Date.now(),
  };
}

function queryAnswerStream(question, model = modelName, apiKey) {
  // let index = 0;
  // const chunks = '今天是个阳，一的美好，也让我对未来充满了期待。我决定以后要经常来公园，感受大自然的魅力，享受生活的美好。今天是个阳，一的美好，也让我对未来充满了期待。我决定以后要经常来公园，感受大自然的魅力，享受生活的美好。今天是个阳，一的美好，也让我对未来充满了期待。我决定以后要经常来公园，感受大自然的魅力，享受生活的美好。今天是个阳，一的美好，也让我对未来充满了期待。今天是个阳，一的美好，也让我对未来充满了期待。我决定以后要经常来公园，感受大自然的魅力，享受生活的美好。今天是个阳，一的美好，也让我对未来充满了期待。我决定以后要经常来公园，感受大自然的魅力，享受生活的美好。今天是个阳，一的美好，也让我对未来充满了期待。我决定以后要经常来公园，感受大自然的魅力，享受生活的美好。今天是个阳，一的美好，也让我对未来充满了期待。我决定以后要经常来公园，感受大自然的魅力，享受生活的美好。我决定以后要经常来公园，感受大自然的魅力，享受生活的美好。'.split('');

  // return {
  //   [Symbol.asyncIterator]() {
  //     return {
  //       next: async () => {
  //         if (index < chunks.length) {
  //           return {
  //             value: {
  //               choices: [
  //                 {
  //                   delta: {
  //                     content: chunks[index++]
  //                   }
  //                 }
  //               ]
  //             },
  //             done: false
  //           };
  //         } else {
  //           return { done: true };
  //         }
  //       }
  //     };
  //   }
  // };

  const client = new OpenAI({
    baseURL: endpoint,
    apiKey,
    dangerouslyAllowBrowser: true // 添加这一行
  });
  return client.chat.completions.create({
    messages: question,
    model,
    stream: true,
  })
}

module.exports = {
  queryAnswer,
  queryAnswerStream,
}