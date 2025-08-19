import { NextResponse } from "next/server";

const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;

const subreddits = [
  "Entrepreneur", "SmallBusiness", "SideHustle", "MakeMoneyOnline",
  "DigitalMarketing", "Passive_Income", "WorkOnline", "Freelance",
  "Marketing", "OnlineBusiness", "AffiliateMarketing", "Ecommerce",
  "Startups", "GrowMyBusiness", "BusinessHub"
];

let accessToken = "";
let tokenExpires = 0;

async function getAccessToken() {
  if (Date.now() < tokenExpires && accessToken) {
    return accessToken;
  }

  const response = await fetch("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
    cache: 'no-store'
  });

  if (!response.ok) {
    console.error("Failed to get Reddit access token:", await response.text());
    throw new Error("Failed to get Reddit access token");
  }

  const data = await response.json();
  accessToken = data.access_token;
  tokenExpires = Date.now() + data.expires_in * 1000 - 60000; // Refresh 1 minute before expiry
  return accessToken;
}

async function fetchSubredditUnauth(subreddit: string) {
  const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`, {
    headers: { "User-Agent": "ReelWriterAI/1.0 (+https://example.com)" },
    cache: 'no-store'
  });
  if (!res.ok) {
    // Return empty array rather than throwing, so one failing subreddit doesn't break everything.
    console.error(`Unauthenticated Reddit fetch failed for r/${subreddit}:`, res.status, await res.text().catch(() => ''));
    return [];
  }
  const json = await res.json();
  return (json.data?.children || []).map((post: any) => post.data);
}

async function fetchSubredditAuth(subreddit: string, token: string) {
  const res = await fetch(`https://oauth.reddit.com/r/${subreddit}/hot.json?limit=10`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store'
  });
  if (!res.ok) {
    console.error(`Authenticated Reddit fetch failed for r/${subreddit}:`, res.status, await res.text().catch(() => ''));
    return [];
  }
  const json = await res.json();
  return (json.data?.children || []).map((post: any) => post.data);
}

export async function GET() {
  try {
    let allPosts: any[] = [];

    if (REDDIT_CLIENT_ID && REDDIT_CLIENT_SECRET) {
      // Use OAuth flow
      const token = await getAccessToken();
      const fetchPromises = subreddits.map((sr) => fetchSubredditAuth(sr, token));
      const results = await Promise.all(fetchPromises);
      allPosts = results.flat();
    } else {
      // Fallback to unauthenticated public endpoints (works server-side)
      const fetchPromises = subreddits.map((sr) => fetchSubredditUnauth(sr));
      const results = await Promise.all(fetchPromises);
      allPosts = results.flat();
    }

    const ideas = allPosts
      .filter(Boolean)
      .map((post: any) => {
        const body = (post.selftext || "").trim();
        const snippetSource = body || post.title || "";
        const snippet = snippetSource.length > 150 ? snippetSource.slice(0, 150) + "..." : snippetSource;
        return {
          id: String(post.id || post.link_id || post.name || post.permalink || `${post.title}-${Math.random().toString(36).slice(2,8)}`),
          title: post.title || (post.link_title || "").slice(0, 200),
          snippet,
          source: `r/${post.subreddit || "unknown"}`,
          url: post.permalink ? `https://www.reddit.com${post.permalink}` : (post.url || "")
        };
      });

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error fetching from Reddit API:", error);
    return NextResponse.json({ error: "Failed to fetch data from Reddit." }, { status: 500 });
  }
}