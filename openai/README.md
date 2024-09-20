
帮我根据 README.md 里面的例子，用 nodejs 和 html 写一套本地使用的和 chatgpt 一样的页面，需要做到的功能如下：
1. 要支持切换 GPT-4o 和 GPT-4omini
2. 要支持新建会话，删除会话
3. 要支持导出功能
4. 对话窗口要能解析 markdown 语法
5. 要支持上传图片，进行提问等功能

Get started
1. Create a personal access token
You do not need to give any permissions to the token. Note that the token will be sent to a Microsoft service.

To use the code snippets below, create an environment variable to set your token as the key for the client code.

If you're using bash:

export GITHUB_TOKEN="<your-github-token-goes-here>"
If you're in powershell:

$Env:GITHUB_TOKEN="<your-github-token-goes-here>"
If you're using Windows command prompt:

set GITHUB_TOKEN=<your-github-token-goes-here>
2. Install dependencies
Install Node.js.

Copy the following lines of text and save them as a file package.json inside your folder.

```json
{
  "type": "module",
  "dependencies": {
    "openai": "latest"
  }
}
```

Open a terminal window in this folder and run npm install.

For each of the code snippets below, copy the content into a file sample.js and run with node sample.js.

3. Run a basic code sample
This sample demonstrates a basic call to the chat completion API. It is leveraging the GitHub AI model inference endpoint and your GitHub token. The call is synchronous.

```js
import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

export async function main() {

  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  const response = await client.chat.completions.create({
    messages: [
        { role:"system", content: "You are a helpful assistant." },
        { role:"user", content: "What is the capital of France?" }
      ],
      model: modelName,
      temperature: 1.0,
      max_tokens: 1000,
      top_p: 1.0
    });

  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
```

4. Explore more samples
Identify and invoke tools
A language model can be given a set of tools it can invoke, for running specific actions depending on the context of the conversation. This sample demonstrates how to define a function tool and how to act on a request from the model to invoke it.

```js
import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

function getFlightInfo({originCity, destinationCity}){
  if (originCity === "Seattle" && destinationCity === "Miami"){
    return JSON.stringify({
      airline: "Delta",
      flight_number: "DL123",
      flight_date: "May 7th, 2024",
      flight_time: "10:00AM"
    });
  }
  return JSON.stringify({error: "No flights found between the cities"});
}

const namesToFunctions = {
  getFlightInfo: (data) =>
  getFlightInfo(data),
};

export async function main() {
  
  const tool = {
    "type": "function",
    "function": {
      name: "getFlightInfo",
      description: "Returns information about the next flight between two cities." +
               "This includes the name of the airline, flight number and the date and time" +
               "of the next flight",
      parameters: {
        "type": "object",
        "properties": {
          "originCity": {
            "type": "string",
            "description": "The name of the city where the flight originates",
          },
          "destinationCity": {
            "type": "string", 
            "description": "The flight destination city",
          },
        },
        "required": [
          "originCity",
          "destinationCity"
        ],
      }
    }
  };
  
  const client = new OpenAI({ baseURL: endpoint, apiKey: token });
  
  let messages=[
      {role: "system", content: "You an assistant that helps users find flight information."},
      {role: "user", content: "I'm interested in going to Miami. What is the next flight there from Seattle?"},
  ];
  
  let response = await client.chat.completions.create({
    messages: messages,
    tools: [tool],
    model: modelName
  });
  
  // We expect the model to ask for a tool call
  if (response.choices[0].finish_reason === "tool_calls"){
  
    // Append the model response to the chat history
    messages.push(response.choices[0].message);

    // We expect a single tool call
    if (response.choices[0].message && response.choices[0].message.tool_calls.length === 1){

      const toolCall = response.choices[0].message.tool_calls[0];
      // We expect the tool to be a function call
      if (toolCall.type === "function"){
        const toolCall = response.choices[0].message.tool_calls[0];
        // Parse the function call arguments and call the function
        const functionArgs = JSON.parse(toolCall.function.arguments);
        console.log(`Calling function \`${toolCall.function.name}\` with arguments ${toolCall.function.arguments}`);
        const callableFunc = namesToFunctions[toolCall.function.name];
        const functionReturn = callableFunc(functionArgs);
        console.log(`Function returned = ${functionReturn}`);
      
        // Append the function call result fo the chat history
        messages.push(
          {
             "tool_call_id": toolCall.id,
             "role": "tool",
             "name": toolCall.function.name,
             "content": functionReturn,
          }
        )

        response = await client.chat.completions.create({
          messages: messages,
          tools: [tool],
          model: modelName
        });
      console.log(`Model response = ${response.choices[0].message.content}`);
      }
    }
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
```

Run a multi-turn conversation
This sample demonstrates a multi-turn conversation with the chat completion API. When using the model for a chat application, you'll need to manage the history of that conversation and send the latest messages to the model.

```js
import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

export async function main() {

  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  const response = await client.chat.completions.create({
    messages: [
      { role: "system", content: "You are a helpful assistant." },
      { role: "user", content: "What is the capital of France?" },
      { role: "assistant", content: "The capital of France is Paris." },
      { role: "user", content: "What about Spain?" }
      ],
      model: modelName
    });

  console.log(response.choices[0].message.content);
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
```

Stream the output
For a better user experience, you will want to stream the response of the model so that the first token shows up early and you avoid waiting for long responses.

```js
import OpenAI from "openai";

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

export async function main() {

  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  const stream = await client.chat.completions.create({
    messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Give me 5 good reasons why I should exercise every day." },
      ],
      model: modelName,
      stream: true
    });

    for await (const part of stream) {
      process.stdout.write(part.choices[0]?.delta?.content || '');
    }
    process.stdout.write('\n');
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
```

Chat with an image input
This model supports using images as inputs. To run a chat completion using a local image file, use the following sample.

```js
import OpenAI from "openai";
import fs from 'fs';

const token = process.env["GITHUB_TOKEN"];
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "gpt-4o";

export async function main() {

  const client = new OpenAI({ baseURL: endpoint, apiKey: token });

  const response = await client.chat.completions.create({
    messages: [
        { role: "system", content: "You are a helpful assistant that describes images in details." },
        { role: "user", content: [
            { type: "text", text: "What's in this image?"},
            { type: "image_url", image_url: {
                url: getImageDataUrl("sample.jpg", "jpg"), details: "low"}}
          ]
        }
      ],
      model: modelName
    });

  console.log(response.choices[0].message.content);
}

/**
 * Get the data URL of an image file.
 * @param {string} imageFile - The path to the image file.
 * @param {string} imageFormat - The format of the image file. For example: "jpeg", "png".
 * @returns {string} The data URL of the image.
 */
function getImageDataUrl(imageFile, imageFormat) {
  try {
      const imageBuffer = fs.readFileSync(imageFile);
      const imageBase64 = imageBuffer.toString('base64');
      return `data:image/${imageFormat};base64,${imageBase64}`;
  } catch (error) {
      console.error(`Could not read '${imageFile}'.`);
      console.error('Set the correct path to the image file before running this sample.');
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("The sample encountered an error:", err);
});
```

5. Going beyond rate limits
The rate limits for the playground and free API usage are intended to help you experiment with models and prototype your AI application. For use beyond those limits, and to bring your application to scale, you must provision resources from an Azure account, and authenticate from there instead of your GitHub personal access token. You don't need to change anything else in your code. Use this link to discover how to go beyond the free tier limits in Azure AI.