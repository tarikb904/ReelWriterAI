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
You are an expert short-form video scriptwriter for TikTok, Reels, and Shorts in the "Make Money Online" and "Business Operations" niches.

Task: Write a complete ~2-minute script based on the content idea and winning hook below. Apply best-practice storytelling (context vs conflict "dance", but/therefore causality, varied rhythm, conversational tone, start-with-the-end, unique lens, strong hook) and optimize for high retention.

Content Idea Title: "${idea.title}"
Content Idea Snippet: "${idea.snippet}"
Winning Hook (must be the opening line verbatim): "${hook}"

Output Rules (strict):
- Output plain spoken narration only, suitable for a teleprompter.
- No timestamps. No labels. No section headings. No bullet points. No numbering.
- No stage directions or camera notes (e.g., "On-screen text:", "Cut to:", "B-roll:", "Music:", "SFX:").
- No bracketed [] or parenthetical () directions.
- Write in a friendly, conversational voice. One sentence per line for readability.
- End with a natural, human CTA that fits the narrative (follow, comment, or save).

Begin with the hook exactly as provided. Then flow into the story and deliver clear, useful value. Keep it concise, engaging, and loop-ready.
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