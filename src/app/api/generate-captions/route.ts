import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { script, apiKey, model } = await request.json();

  if (!script || !apiKey || !model) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const prompt = `
You are a social media strategist trained in 2025 best practices for cross-platform content creation. Your expertise is in the "Make Money Online" and "Business Operations" niches.

Based on the script provided below, write platform-specific captions and titles. Follow the output format exactly.

**Script:**
---
${script}
---

**Output Format:**

1️⃣ 📲 Instagram / Facebook / Threads Caption
[Hook in the first 80–100 characters]
[Value-packed and emotional or insightful middle (100–150 words max)]
[Clear call to action (Save, Comment, Tag, etc.)]
[Use emojis to enhance readability and tone]
[End with exactly 9 hashtags, grouped as: 3 high-volume, 3 topic-specific, 3 niche-specific. Format hashtags all in one line, separated by spaces. No line breaks.]

2️⃣ 💼 LinkedIn Caption
[Professional yet engaging tone]
[Begin with a strong insight, hook, or stat]
[Expand briefly with context, value, or takeaway]
[Use 1 CTA (e.g., “What do you think?”, “Let’s discuss”)]
[Add no more than 5 hashtags, placed at the end, and aligned to industry/subject]

3️⃣ 📺 10 YouTube Titles
[Generate 10 titles]
[Max 60 characters each]
[Use clear keywords that describe the video]
[Include curiosity, urgency, or benefit]
[Add numbers if appropriate (e.g., “5 Tips…” or “How to…”)]
[Avoid clickbait — keep it authentic]
[Each title on a new line, do not number them]
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
      return NextResponse.json({ error: `Failed to generate captions. API returned: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const rawContent = data.choices[0].message.content;

    // Basic parsing of the response based on the expected format
    const sections = rawContent.split(/1️⃣|2️⃣|3️⃣/);
    
    const instagram = sections[1]?.replace('📲 Instagram / Facebook / Threads Caption', '').trim() || "Could not generate Instagram caption.";
    const linkedin = sections[2]?.replace('💼 LinkedIn Caption', '').trim() || "Could not generate LinkedIn caption.";
    const youtubeTitles = sections[3]?.replace('📺 10 YouTube Titles', '').trim().split('\n').filter(Boolean) || ["Could not generate YouTube titles."];

    return NextResponse.json({ instagram, linkedin, youtubeTitles });

  } catch (error) {
    console.error("Error calling OpenRouter API:", error);
    return NextResponse.json({ error: "An internal error occurred while generating captions." }, { status: 500 });
  }
}