const OpenAI = require('./lib/openai')

const endpoint = 'https://models.inference.ai.azure.com'
const defaultModel = 'gpt-4o-mini'

function askByOpenAI(question, options = {}) {
  const { baseURL = endpoint, model = defaultModel, apiKey = '', stream = false } = options
  console.log('api:askByOpenAI', question, options)

  const client = new OpenAI({
    baseURL,
    apiKey,
    dangerouslyAllowBrowser: true, // 添加这一行
  })
  return client.chat.completions.create({
    messages: question,
    model,
    stream,
  })
}

module.exports = {
  askByOpenAI,
}

// mock stream
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
