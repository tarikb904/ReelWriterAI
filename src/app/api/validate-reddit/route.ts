import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { clientId, clientSecret } = await request.json();

    if (!clientId || !clientSecret) {
      return NextResponse.json({ ok: false, message: "Missing clientId or clientSecret" }, { status: 400 });
    }

    try {
      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      const res = await fetch("https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${auth}`,
          "User-Agent": "ReelWriterAI/1.0 (https://example.com)"
        },
        body: "grant_type=client_credentials",
        cache: 'no-store'
      });

      const text = await res.text();

      if (!res.ok) {
        return NextResponse.json({ ok: false, message: `Reddit returned ${res.status}: ${text}` }, { status: 401 });
      }

      // parse token info if possible
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { raw: text };
      }

      return NextResponse.json({ ok: true, message: "Reddit credentials validated", data });
    } catch (err: any) {
      console.error("Reddit validation error:", err);
      return NextResponse.json({ ok: false, message: "Failed to validate Reddit credentials: " + (err?.message || String(err)) }, { status: 502 });
    }
  } catch (err: any) {
    console.error("validate-reddit error:", err);
    return NextResponse.json({ ok: false, message: "Invalid request" }, { status: 400 });
  }
}