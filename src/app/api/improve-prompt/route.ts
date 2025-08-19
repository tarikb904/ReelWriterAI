import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { prompt, apiKey, model } = await request.json();

    if (!prompt || !apiKey || !model) {
      return NextResponse.json({ error: "Missing required parameters: prompt, apiKey, model" }, { status: 400 });
    }

    const improvementPrompt = `
You are an expert content strategist. Improve the following research prompt to make it more effective, clear, and engaging for generating viral content ideas in the "Make Money Online" and "Business Operations" niches. Keep it concise.

Original prompt:
"""
${prompt}
"""

Improved prompt:
`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: improvementPrompt }]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      return NextResponse.json({ error: `Failed to improve prompt. API returned: ${errorText}` }, { status: response.status });
    }

    const data = await response.json();
    const improvedPrompt = data.choices[0].message.content.trim();

    return NextResponse.json({ improvedPrompt });
  } catch (error) {
    console.error("Error in improve prompt route:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}