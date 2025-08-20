import { NextResponse } from "next/server";

const DEFAULT_PROMPT = `
You are an expert content researcher specializing in the "Make Money Online" and "Business Operations" niches. Your task is to generate a list of 20 viral content ideas that are currently trending or highly engaging.

Each idea should include:
- A concise, catchy title.
- A brief snippet or summary (max 150 characters).
- The source or platform where this idea is trending (e.g., Reddit, Hacker News, Blogs).
- A URL to the original content or a relevant link.

Format the output as a JSON array of objects with keys: id, title, snippet, source, url.

Begin generating the ideas now.
`;

export async function POST(request: Request) {
  try {
    const { prompt, apiKey, model } = await request.json();

    if (!prompt || !apiKey || !model) {
      return NextResponse.json({ error: "Missing required parameters: prompt, apiKey, model" }, { status: 400 });
    }

    let response;
    if (model.startsWith("openai/")) {
      // Strip "openai/" prefix for OpenAI API
      const openAiModel = model.replace(/^openai\//, "");
      response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: openAiModel,
          messages: [{ role: "user", content: prompt }]
        })
      });
    } else {
      // Default to OpenRouter
      response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: prompt }]
        })
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ error: `Failed to generate research. API returned: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to parse JSON from AI output
    let ideas = [];
    try {
      ideas = JSON.parse(content);
    } catch {
      // fallback: try to extract JSON substring without 's' flag
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        ideas = JSON.parse(jsonMatch[0]);
      } else {
        return NextResponse.json({ error: "Failed to parse AI response as JSON" }, { status: 500 });
      }
    }

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error in AI research route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}