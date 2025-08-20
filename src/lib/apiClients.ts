"use server";

export async function callOpenAIChatCompletion(apiKey: string, messages: any[], model: string): Promise<string> {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenAI API error: ${text}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}

export async function callGoogleGeminiChatCompletion(apiKey: string, messages: any[], model: string): Promise<string> {
  // Placeholder: Google Gemini API integration is not publicly available yet.
  // This function returns a rejected Promise to satisfy the return type.
  return Promise.reject(new Error("Google Gemini API integration not implemented."));
}

export async function callAnthropicClaudeChatCompletion(apiKey: string, messages: any[], model: string): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/complete", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      prompt: messages.map(m => m.content).join("\n\n"),
      max_tokens_to_sample: 1000,
      stop_sequences: ["\n\nHuman:"],
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Anthropic Claude API error: ${text}`);
  }
  const data = await res.json();
  return data.completion;
}

export async function callOpenRouterChatCompletion(apiKey: string, messages: any[], model: string): Promise<string> {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter API error: ${text}`);
  }
  const data = await res.json();
  return data.choices[0].message.content;
}