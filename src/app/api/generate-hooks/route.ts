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
You are an expert short-form video scriptwriter specializing in creating high-performing hooks for platforms like TikTok, Instagram Reels, and YouTube Shorts.

Let's break down the process of creating a high-performing hook into detailed steps...

Content Idea Title: "${idea.title}"
Content Idea Snippet: "${idea.snippet}"

Generate exactly 10 compelling video hooks based on the above principles.
Each hook should be short, punchy, and under 15 words.
Do not number the hooks; list each on a new line.
Begin generating now:
`;

  try {
    let generatedText = "";

    if (model.startsWith("openai/")) {
      const openAiModel = model.replace(/^openai\//, "");
      generatedText = await callOpenAIChatCompletion(apiKey, [{ role: "user", content: prompt }], openAiModel);
    } else if (model.startsWith("google/")) {
      const gemModel = model.replace(/^google\//, "");
      generatedText = await callGoogleGeminiChatCompletion(apiKey, [{ role: "user", content: prompt }], gemModel);
    } else if (model.startsWith("anthropic/")) {
      const anthModel = model.replace(/^anthropic\//, "");
      generatedText = await callAnthropicClaudeChatCompletion(apiKey, [{ role: "user", content: prompt }], anthModel);
    } else {
      generatedText = await callOpenRouterChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    }

    const hooks = generatedText.split('\n').filter((hook) => hook.trim() !== '');

    return NextResponse.json({ hooks });

  } catch (err: unknown) {
    console.error("Error generating hooks:", err);
    const message = err instanceof Error ? err.message : "An internal error occurred while generating hooks.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}