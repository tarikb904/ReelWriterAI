import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ ok: false, message: "Missing apiKey" }, { status: 400 });
    }

    // Try OpenRouter models endpoint
    try {
      const res = await fetch("https://openrouter.ai/api/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        cache: 'no-store'
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        // If models endpoint isn't available or returns 401/403, return failure with message
        return NextResponse.json({
          ok: false,
          message: `OpenRouter returned ${res.status}. ${text ? text.slice(0, 200) : ""}`
        }, { status: 401 });
      }

      const data = await res.json();
      // data.models or data may vary — normalize
      const models = Array.isArray(data.models)
        ? data.models.map((m: any) => (typeof m === "string" ? m : m.id || m.name || JSON.stringify(m)))
        : Array.isArray(data) ? data : [];

      return NextResponse.json({ ok: true, message: "API key validated", models });
    } catch (err: any) {
      console.error("OpenRouter models check failed:", err);
      // Provide a friendly fallback message — we couldn't validate via models endpoint
      return NextResponse.json({
        ok: false,
        message: "Could not validate key with OpenRouter models endpoint. Please ensure the key is correct and try a small generation. Error: " + (err?.message || String(err))
      }, { status: 502 });
    }
  } catch (err: any) {
    console.error("validate-key error:", err);
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}