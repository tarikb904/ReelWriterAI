import { NextResponse } from "next/server";
import {
  callOpenAIChatCompletion,
  callGoogleGeminiChatCompletion,
  callAnthropicClaudeChatCompletion,
  callOpenRouterChatCompletion,
} from "@/lib/apiClients";

export async function POST(request: Request) {
  const { script, apiKey, model } = await request.json();

  if (!script || !apiKey || !model) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const prompt = `
You are a social media content strategist trained in 2025 best practices for cross-platform content creation.

Based on the script provided below, write platform-specific captions and titles for:

- Instagram, Facebook, and Threads (grouped as one caption)
- LinkedIn
- YouTube (title only)

🔹 Input:
Script:
"""
${script}
"""

🔹 Output Format (Exact Structure):

1️⃣ 📲 Instagram / Facebook / Threads Caption
Hook in the first 80–100 characters

Value-packed and emotional or insightful middle (100–150 words max)

Clear call to action (Save, Comment, Tag, etc.)

Use emojis to enhance readability and tone

End with exactly 9 hashtags, grouped as:

🔺 3 High-volume, trending hashtags (broad but relevant to topic)

🎯 3 Topic-specific hashtags (mid-volume, directly about the post)

🧠 3 Niche-specific hashtags (low-volume, hyper-targeted to the sub-niche)

✅ Format hashtags all in one line, separated by spaces. No line breaks.

2️⃣ 💼 LinkedIn Caption
Professional yet engaging tone

Begin with a strong insight, hook, or stat

Expand briefly with context, value, or takeaway

Use 1 CTA (e.g., “What do you think?”, “Let’s discuss”)

Keep it human, helpful, and aligned with thought leadership

Add no more than 5 hashtags, placed at the end, and aligned to industry/subject

3️⃣ 📺 Give me 10 YouTube Titles
Max 60 characters

Use clear keywords that describe the video

Include curiosity, urgency, or benefit

Add numbers if appropriate (e.g., “5 Tips…” or “How to…”)

Avoid clickbait — keep it authentic

Generate the captions and titles now.
`;

  try {
    let rawContent = "";

    if (model.startsWith("openai/")) {
      const openAiModel = model.replace(/^openai\//, "");
      rawContent = await callOpenAIChatCompletion(apiKey, [{ role: "user", content: prompt }], openAiModel);
    } else if (model.startsWith("google/gemini")) {
      rawContent = await callGoogleGeminiChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else if (model.startsWith("anthropic/")) {
      rawContent = await callAnthropicClaudeChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else {
      rawContent = await callOpenRouterChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    }

    // Parse and format output for better preview
    const parsed = parseCaptions(rawContent);

    // Format Instagram caption for preview: replace newlines with <br> and preserve paragraphs
    const instagramPreview = parsed.instagram
      .split(/\n{2,}/) // split by double newlines for paragraphs
      .map(paragraph => paragraph.trim().replace(/\n/g, "<br />"))
      .join("<br /><br />");

    // Format LinkedIn caption similarly
    const linkedinPreview = parsed.linkedin
      .split(/\n{2,}/)
      .map(paragraph => paragraph.trim().replace(/\n/g, "<br />"))
      .join("<br /><br />");

    return NextResponse.json({
      instagram: parsed.instagram,
      instagramPreview,
      linkedin: parsed.linkedin,
      linkedinPreview,
      youtubeTitles: parsed.youtubeTitles,
    });

  } catch (error) {
    console.error("Error generating captions:", error);
    return NextResponse.json({ error: "An internal error occurred while generating captions." }, { status: 500 });
  }
}

/**
 * Optional helper to parse the raw content into structured JSON.
 * This is a simple heuristic and can be improved based on actual output format.
 */
function parseCaptions(raw: string) {
  // Attempt to split by the numbered sections 1️⃣, 2️⃣, 3️⃣
  const sections = raw.split(/1️⃣|2️⃣|3️⃣/).map(s => s.trim()).filter(Boolean);

  const instagramSection = sections[0]?.replace(/📲 Instagram \/ Facebook \/ Threads Caption/i, "").trim() || "";
  const linkedinSection = sections[1]?.replace(/💼 LinkedIn Caption/i, "").trim() || "";
  const youtubeSectionRaw = sections[2]?.replace(/📺 Give me 10 YouTube Titles/i, "").trim() || "";

  // Extract YouTube titles as array by splitting lines and filtering empty lines
  const youtubeTitles = youtubeSectionRaw.split("\n").map(line => line.trim()).filter(line => line.length > 0);

  return {
    instagram: instagramSection,
    linkedin: linkedinSection,
    youtubeTitles,
  };
}