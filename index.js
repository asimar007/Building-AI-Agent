import "dotenv/config";
import OpenAI from "openai";
import readlineSync from "readline-sync";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const client = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

// Tools

function getWeatherDetails(city = "") {
  if (city.toLocaleLowerCase() === "kolkata") return "10°C";
  if (city.toLocaleLowerCase() === "delhi") return "19°C";
  if (city.toLocaleLowerCase() === "bangalore") return "14°C";
  if (city.toLocaleLowerCase() === "mohali") return "21°C";
}

const tools = {
  getWeatherDetails: getWeatherDetails,
};
// System Prompts

const SYSTEM_PROMPTS = `
You are an AI Assistant with START, PLAN, ACTION, OBESERVATION and Output State.
Wait for the user prompts and first Plan using available tools.
After plaining, Take action with appropriate tools and wait for Obersvation based on Action.
Once you get the obeservation, Return the AI response based on START prompt and obeservations.

Strickly follow the JSON output format as in Example

Available Tools:
 - getWeatherDetails(city: string): string
 getWeatherDetails is a function that accepts city name as string and returns the weather details.

Example:
START
{"type": "user", "user": "What is the sum of weather of kolkata and delhi?"}
{"type": "plan", "plan": "I will call the getWeatherDetails for kolkata"}
{"type": "action", "function": "getWeatherDetails", "input": "kolkata"}
{"type": "obeservation", "obeservation": "10°C"}
{"type": "plan", "plan": "I will call the getWeatherDetails for delhi"}
{"type": "action", "function": "getWeatherDetails", "input": "delhi"}
{"type": "obeservation", "obeservation": "19°C"}
{"type": "output", "output": "The sum of weather of kolkata and delhi is 29°C"}
`;

const messages = [{ role: "system", content: SYSTEM_PROMPTS }];

while (true) {
  const query = readlineSync.question("> ");
  const q = {
    type: "user",
    user: query,
  };
  messages.push({ role: "user", content: JSON.stringify(q) });

  while (true) {
    const chat = await client.chat.completions.create({
      model: "gpt-4o",
      messages: messages,
      response_format: { type: "json_object" },
    });
    const result = chat.choices[0].message.content;
    messages.push({ role: "assistant", content: result });
    console.log(`\n\n-----------------Start AI-------------------`);
    console.log(result);
    console.log(`-----------------End AI-------------------\n\n`);

    const call = JSON.parse(result);

    if (call.type == "output") {
      console.log(`🤖: ${call.output}`);
      break;
    } else if (call.type == "action") {
      const fn = tools[call.function];
      const observation = fn(call.input);
      const obs = { type: "observation", observation: observation };
      messages.push({ role: "developer", content: JSON.stringify(obs) });
    }
  }
}
