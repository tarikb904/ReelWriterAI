import { NextResponse } from "next/server";

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
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      return NextResponse.json({ error: `Failed to generate script. API returned: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const script = data.choices[0].message.content;

    return NextResponse.json({ script });

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return NextResponse.json({ error: "An internal error occurred while generating the script." }, { status: 500 });
  }
}