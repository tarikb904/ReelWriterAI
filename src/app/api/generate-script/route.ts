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
You are an expert short-form video scriptwriter for platforms like TikTok, Instagram Reels, and YouTube Shorts. Your specialty is the "Make Money Online" and "Business Operations" niche.

Your task is to write a complete 2-minute video script based on the provided content idea and the winning hook.

**Content Idea Title:** "${idea.title}"
**Winning Hook:** "${hook}"

**Script Structure Requirements:**
1.  **Hook (Already Provided):** Start the script *exactly* with the winning hook: "${hook}".
2.  **Introduction (15-20 seconds):** Immediately after the hook, expand on the problem or promise. Briefly explain why this topic is crucial for the viewer.
3.  **Main Body (90 seconds):** Break down the core message into 3-5 clear, actionable, and easy-to-understand points or steps. Use simple language. Avoid jargon. Each point should provide tangible value.
4.  **Call to Action (CTA) (10-15 seconds):** End with a strong, clear call to action. Encourage viewers to comment with their thoughts, follow for more tips, or check a link in the bio.
5.  **Formatting:** Use clear headings for each section (e.g., "[HOOK]", "[INTRODUCTION]", "[POINT 1]", "[CTA]"). Add visual cues or suggestions in parentheses, like "(Show a screenshot of the app)" or "(Point to the text on screen)".

Generate the script now.
`;

  try {
    let generatedText = "";

    if (model.startsWith("openai/")) {
      const openAiModel = model.replace(/^openai\//, "");
      generatedText = await callOpenAIChatCompletion(apiKey, [{ role: "user", content: prompt }], openAiModel);
    } else if (model.startsWith("google/gemini")) {
      generatedText = await callGoogleGeminiChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else if (model.startsWith("anthropic/")) {
      generatedText = await callAnthropicClaudeChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
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