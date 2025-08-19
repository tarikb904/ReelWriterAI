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

export async function GET() {
  if (!REDDIT_CLIENT_ID || !REDDIT_CLIENT_SECRET) {
    return NextResponse.json({ error: "Reddit API credentials are not configured." }, { status: 500 });
  }

  try {
    const token = await getAccessToken();
    const fetchPromises = subreddits.map(subreddit =>
      fetch(`https://oauth.reddit.com/r/${subreddit}/hot.json?limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then(res => res.json())
    );

    const results = await Promise.all(fetchPromises);
    
    const ideas = results.flatMap(result => 
      result.data?.children.map((post: any) => ({
        id: post.data.id,
        title: post.data.title,
        snippet: post.data.selftext.slice(0, 150) + (post.data.selftext.length > 150 ? '...' : ''),
        source: `r/${post.data.subreddit}`,
        url: `https://www.reddit.com${post.data.permalink}`,
      })) || []
    );

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error fetching from Reddit API:", error);
    return NextResponse.json({ error: "Failed to fetch data from Reddit." }, { status: 500 });
  }
}