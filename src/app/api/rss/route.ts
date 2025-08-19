import { NextResponse } from "next/server";
import Parser from "rss-parser";

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

export async function GET() {
  try {
    const fetchPromises = rssFeeds.map(feedUrl => parser.parseURL(feedUrl));
    const results = await Promise.all(fetchPromises);

    const ideas = results.flatMap(feed => 
      feed.items.slice(0, 5).map(item => ({
        id: item.guid || item.link,
        title: item.title,
        snippet: (item.contentSnippet || item.content || '').slice(0, 150) + ((item.contentSnippet || item.content || '').length > 150 ? '...' : ''),
        source: feed.title,
        url: item.link,
      })) || []
    );

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error fetching from RSS feeds:", error);
    return NextResponse.json({ error: "Failed to fetch data from RSS feeds." }, { status: 500 });
  }
}