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

Let's break down the process of creating a high-performing hook into detailed steps, drawing from the information in the video:

1. Identify Your Visuals
   - Begin by taking a close look at the video footage or visual assets you plan to use for the first 3-5 seconds of your video.
   - Ask yourself: What is the main subject of the visuals? Is there any movement or action? Are the visuals clear and easy to understand, or are they abstract? Do the visuals evoke any specific emotions?
   - Determine the "key visual" – the most compelling or attention-grabbing element within those first few seconds.

2. Determine Interesting Angles
   - Delve into the core message or story of your video and identify the most compelling "angles" or pieces of information.
   - Consider: Is there anything surprising or unexpected about your topic? Can you present your topic in a way that challenges conventional wisdom? Is there a problem that your video solves? Is there something new or unknown that you can reveal?
   - Evaluate the potential for "contrast" within each angle.

3. Write the Spoken Hook
   - Craft a concise spoken hook, aiming for two to four lines of dialogue.
   - Incorporate context, lean, contrast, and optionally a contrarian snapback.

4. Add On-Screen Text
   - Use on-screen text to reinforce the visual and spoken hook.
   - Keep text brief and easy to read.

5. Review and Assess
   - Watch the hook with both visual and audio elements.
   - Evaluate clarity, attention-grabbing power, and alignment.

Key Takeaways:
- Alignment is essential.
- Visuals are paramount.
- Comprehension is key.
- Iterate and refine.

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
    } else if (model.startsWith("google/gemini")) {
      generatedText = await callGoogleGeminiChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else if (model.startsWith("anthropic/")) {
      generatedText = await callAnthropicClaudeChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
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