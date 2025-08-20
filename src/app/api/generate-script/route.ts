import { NextResponse } from "next/server";
import {
  callOpenAIChatCompletion,
  callGoogleGeminiChatCompletion,
  callAnthropicClaudeChatCompletion,
  callOpenRouterChatCompletion,
} from "@/lib/apiClients";

export async function POST(request: Request) {
  const { idea, hook, apiKey, model } = await request.json();

  if (!idea || !hook || !apiKey || !model) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const prompt = `
You are an expert short-form video scriptwriter specializing in creating engaging and addictive scripts for platforms like TikTok, Instagram Reels, and YouTube Shorts, focusing on the "Make Money Online" and "Business Operations" niches.

Your task is to write a complete 2-minute video script based on the following content idea and winning hook.

Content Idea Title: "${idea.title}"
Content Idea Snippet: "${idea.snippet}"
Winning Hook: "${hook}"

[... full instructions omitted here for brevity in code — kept as previously implemented ...]
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

    return NextResponse.json({ script: generatedText });

  } catch (err: unknown) {
    console.error("Error generating script:", err);
    const message = err instanceof Error ? err.message : "An internal error occurred while generating the script.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}