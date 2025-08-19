"use server";

interface ResearchResult {
  title: string;
  description: string;
}

export async function researchTopics(
  topic: string,
  apiKey: string
): Promise<ResearchResult[]> {
  const prompt = `
    You are a viral content expert. Generate 5 creative and engaging content ideas based on the topic: "${topic}".
    For each idea, provide a "title" and a short "description".
    Return the output as a valid JSON array of objects, like this: [{"title": "...", "description": "..."}]
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    // The AI might return the array inside a key, so we need to find it.
    const resultsArray = Array.isArray(content) ? content : Object.values(content)[0];
    
    if (!Array.isArray(resultsArray)) {
      throw new Error("AI did not return a valid array of ideas.");
    }

    return resultsArray;
  } catch (error) {
    console.error("Error in researchTopics:", error);
    throw new Error("Failed to generate research topics.");
  }
}

export async function improveIdea(
  idea: string,
  apiKey: string
): Promise<string> {
  const prompt = `
    You are an expert content strategist. Improve the following content idea to make it more catchy, specific, and likely to go viral.
    Return ONLY the improved idea as a single string. Do not add any extra text or formatting.
    Original idea: "${idea}"
  `;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mistralai/mistral-7b-instruct:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error: ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error("Error in improveIdea:", error);
    throw new Error("Failed to improve the idea.");
  }
}