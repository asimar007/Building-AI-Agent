import { Mistral } from "@mistralai/mistralai";
import * as dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.MISTRAL_API_KEY;

const client = new Mistral({ apiKey: apiKey });

async function getJsonOutput() {
  const chatResponse = await client.chat.complete({
    model: "mistral-large-latest",
    messages: [{ role: "user", content: "What is the best French cheese?" }],
    responseFormat: { type: "json_object" },
  });

  const result = JSON.parse(chatResponse.choices[0].message.content);
  console.log(result);
}

getJsonOutput();
