import { NextResponse } from "next/server";
import Parser from "rss-parser";

const redditSubreddits = [
  "Entrepreneur", "SmallBusiness", "SideHustle", "MakeMoneyOnline",
  "DigitalMarketing", "Passive_Income", "WorkOnline", "Freelance",
  "Marketing", "OnlineBusiness", "AffiliateMarketing", "Ecommerce",
  "Startups", "GrowMyBusiness", "BusinessHub"
];

const rssFeeds = [
  "https://www.smartpassiveincome.com/feed/",
  "https://neilpatel.com/blog/feed/",
  "https://www.entrepreneur.com/latest.xml",
  "https://www.sidehustlenation.com/feed/",
  "https://www.thepennyhoarder.com/feed/",
  "https://www.makingsenseofcents.com/feed/",
  "https://problogger.com/feed/",
  "https://foundr.com/feed/",
  "https://blog.hubspot.com/marketing/rss.xml",
  "https://growthlab.com/feed/",
  "https://sidehustleschool.com/feed/",
  "https://copyblogger.com/feed/",
  "https://hbr.org/feed",
  "https://www.businessinsider.com/entrepreneurship.rss",
  "https://bloggingwizard.com/feed/",
];

const parser = new Parser();

async function fetchRedditPosts(subreddit: string) {
  const res = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`, {
    headers: { "User-Agent": "ReelWriterAI/1.0" },
    cache: 'no-store'
  });
  if (!res.ok) return [];
  const json = await res.json();
  return (json.data?.children || []).map((post: any) => post.data);
}

async function fetchHackerNewsTopStories() {
  const topRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
  if (!topRes.ok) return [];
  const topIds = await topRes.json();
  const fetches = topIds.slice(0, 30).map((id: number) =>
    fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json())
  );
  const stories = await Promise.all(fetches);
  return stories.filter((s) => s && s.title && s.url);
}

export async function GET() {
  try {
    // Fetch Reddit posts concurrently
    const redditPromises = redditSubreddits.map(sr => fetchRedditPosts(sr));
    const redditResults = await Promise.all(redditPromises);
    const redditPosts = redditResults.flat();

    // Fetch RSS feeds concurrently
    const rssPromises = rssFeeds.map(url => parser.parseURL(url));
    const rssResults = await Promise.all(rssPromises);
    const rssPosts = rssResults.flatMap(feed =>
      feed.items.slice(0, 5).map(item => ({
        id: item.guid || item.link,
        title: item.title,
        snippet: (item.contentSnippet || item.content || '').slice(0, 150) + ((item.contentSnippet || item.content || '').length > 150 ? '...' : ''),
        source: feed.title,
        url: item.link,
      }))
    );

    // Fetch Hacker News stories
    const hnStories = await fetchHackerNewsTopStories();
    const hnPosts = hnStories.map((story: any) => ({
      id: story.id.toString(),
      title: story.title,
      snippet: story.text ? story.text.slice(0, 150) + (story.text.length > 150 ? '...' : '') : 'Read the full story for more details.',
      source: "Hacker News",
      url: story.url,
    }));

    // Normalize Reddit posts
    const normalizedReddit = redditPosts.map((post: any) => {
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

    // Combine all sources
    const combined = [...normalizedReddit, ...rssPosts, ...hnPosts];

    // Deduplicate by title
    const unique = Array.from(new Map(combined.map(item => [item.title, item])).values());

    // Shuffle and limit to 50
    const shuffled = unique.sort(() => 0.5 - Math.random()).slice(0, 50);

    return NextResponse.json(shuffled);
  } catch (error) {
    console.error("Error fetching viral content:", error);
    return NextResponse.json({ error: "Failed to fetch viral content." }, { status: 500 });
  }
}