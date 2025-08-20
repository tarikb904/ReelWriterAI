import { NextResponse } from "next/server";
import {
  callOpenAIChatCompletion,
  callGoogleGeminiChatCompletion,
  callAnthropicClaudeChatCompletion,
  callOpenRouterChatCompletion,
} from "@/lib/apiClients";

export async function POST(request: Request) {
  const { idea, apiKey, model } = await request.json();

  if (!idea || !apiKey || !model) {
    return NextResponse.json({ error: "Missing required parameters: idea, apiKey, model" }, { status: 400 });
  }

  const prompt = `
You are an expert short-form video scriptwriter specializing in the "Make Money Online" and "Business Operations" niches. Your goal is to create highly engaging and scroll-stopping video hooks.

Based on the following viral content idea, generate exactly 10 compelling video hooks.

**Content Idea Title:** "${idea.title}"
**Content Idea Snippet:** "${idea.snippet}"

**Instructions:**
1.  Each hook must be short, punchy, and under 15 words.
2.  Use strong, attention-grabbing language.
3.  Focus on curiosity, controversy, a surprising fact, or a common pain point.
4.  Do not number the hooks in the output.
5.  Each hook must be on a new line.

**Example Output Format:**
This is the first hook.
Here is another amazing hook.
And a third one right here.

Begin generating the hooks now:
`;

  try {
    let generatedText = "";

    if (model.startsWith("openai/")) {
      generatedText = await callOpenAIChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else if (model.startsWith("google/gemini")) {
      generatedText = await callGoogleGeminiChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else if (model.startsWith("anthropic/")) {
      generatedText = await callAnthropicClaudeChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else {
      // Default to OpenRouter
      generatedText = await callOpenRouterChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    }

    const hooks = generatedText.split('\n').filter((hook) => hook.trim() !== '');

    return NextResponse.json({ hooks });

  } catch (error: any) {
    console.error("Error generating hooks:", error);
    return NextResponse.json({ error: error.message || "An internal error occurred while generating hooks." }, { status: 500 });
  }
}