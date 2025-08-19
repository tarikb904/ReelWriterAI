import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Fetch top story IDs
    const topStoriesRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json");
    if (!topStoriesRes.ok) {
      throw new Error("Failed to fetch top stories from Hacker News");
    }
    const topStoryIds = await topStoriesRes.json();

    // Fetch details for the top 30 stories
    const fetchPromises = topStoryIds.slice(0, 30).map((id: number) => 
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
    );

    const stories = await Promise.all(fetchPromises);

    const ideas = stories
      .filter(story => story && story.title && story.url) // Ensure story has a title and URL
      .map((story: any) => ({
        id: story.id.toString(),
        title: story.title,
        snippet: story.text ? story.text.slice(0, 150) + (story.text.length > 150 ? '...' : '') : 'Read the full story for more details.',
        source: "Hacker News",
        url: story.url,
      }));

    return NextResponse.json(ideas);
  } catch (error) {
    console.error("Error fetching from Hacker News API:", error);
    return NextResponse.json({ error: "Failed to fetch data from Hacker News." }, { status: 500 });
  }
}