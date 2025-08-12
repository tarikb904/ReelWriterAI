import axios from 'axios';
import { ContentIdea, RedditPost, RSSItem } from '../types';
import { API_KEYS, TARGET_SUBREDDITS, RSS_FEEDS } from '../config/constants';

// CORS proxy for development
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

// Reddit API
export const fetchRedditPosts = async (): Promise<ContentIdea[]> => {
  const ideas: ContentIdea[] = [];
  
  try {
    // Fetch from multiple subreddits
    const promises = TARGET_SUBREDDITS.slice(0, 5).map(async (subreddit) => {
      try {
        const response = await axios.get(
          `${CORS_PROXY}https://www.reddit.com/r/${subreddit}/hot.json?limit=10`,
          {
            timeout: 10000,
          }
        );
        
        const posts = response.data?.data?.children || [];
        
        return posts.map((post: any): ContentIdea => ({
          id: `reddit_${post.data.id}`,
          title: post.data.title,
          snippet: post.data.selftext?.substring(0, 200) || post.data.title,
          source: `r/${subreddit}`,
          url: `https://reddit.com${post.data.permalink}`,
          score: post.data.score,
          createdAt: new Date(),
        }));
      } catch (error) {
        console.warn(`Failed to fetch from r/${subreddit}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(promises);
    ideas.push(...results.flat());
  } catch (error) {
    console.error('Error fetching Reddit posts:', error);
  }
  
  return ideas;
};

// RSS Feed parsing
export const fetchRSSFeeds = async (): Promise<ContentIdea[]> => {
  const ideas: ContentIdea[] = [];
  
  try {
    // Fetch from RSS feeds
    const promises = RSS_FEEDS.slice(0, 5).map(async (feed) => {
      try {
        const response = await axios.get(
          `${CORS_PROXY}${encodeURIComponent(feed.url)}`,
          {
            timeout: 10000,
          }
        );
        
        // Simple RSS parsing
        const xmlText = response.data;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const items = xmlDoc.querySelectorAll('item');
        
        const feedIdeas: ContentIdea[] = [];
        items.forEach((item, index) => {
          if (index < 5) { // Limit to 5 items per feed
            const title = item.querySelector('title')?.textContent || '';
            const description = item.querySelector('description')?.textContent || '';
            const link = item.querySelector('link')?.textContent || '';
            
            if (title && link) {
              feedIdeas.push({
                id: `rss_${feed.name.replace(/\s+/g, '_')}_${index}`,
                title: title.trim(),
                snippet: description.replace(/<[^>]*>/g, '').substring(0, 200),
                source: feed.name,
                url: link,
                createdAt: new Date(),
              });
            }
          }
        });
        
        return feedIdeas;
      } catch (error) {
        console.warn(`Failed to fetch RSS from ${feed.name}:`, error);
        return [];
      }
    });
    
    const results = await Promise.all(promises);
    ideas.push(...results.flat());
  } catch (error) {
    console.error('Error fetching RSS feeds:', error);
  }
  
  return ideas;
};

// Combine and deduplicate content ideas
export const fetchContentIdeas = async (): Promise<ContentIdea[]> => {
  try {
    const [redditIdeas, rssIdeas] = await Promise.all([
      fetchRedditPosts(),
      fetchRSSFeeds(),
    ]);
    
    const allIdeas = [...redditIdeas, ...rssIdeas];
    
    // Simple deduplication based on title similarity
    const uniqueIdeas = allIdeas.filter((idea, index, self) => {
      return index === self.findIndex(other => 
        other.title.toLowerCase().trim() === idea.title.toLowerCase().trim()
      );
    });
    
    // Sort by score (Reddit) or date, limit to top 50
    return uniqueIdeas
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, 50);
  } catch (error) {
    console.error('Error fetching content ideas:', error);
    return [];
  }
};

// AI API calls
export const generateHooks = async (
  contentIdea: ContentIdea,
  apiProvider: string = 'openrouter',
  model: string = 'anthropic/claude-3.5-sonnet'
): Promise<string[]> => {
  try {
    const prompt = `Based on this viral content idea, generate 10 engaging short-form video hooks for the Make Money Online/BizOps niche. Each hook should be 1-2 sentences and grab attention immediately.

Content Idea: "${contentIdea.title}"
Description: "${contentIdea.snippet}"

Generate hooks that:
1. Create curiosity or urgency
2. Promise value or transformation
3. Use numbers, questions, or bold statements
4. Are under 20 words each
5. Target entrepreneurs and side hustlers

Return only the 10 hooks, numbered 1-10, no additional text.`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.8,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEYS.OPENROUTER}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ReelWriterAI',
        },
      }
    );
    
    const content = response.data.choices[0]?.message?.content || '';
    
    // Parse the numbered hooks
    const hooks = content
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(hook => hook.length > 0);
    
    return hooks.length > 0 ? hooks : ['Failed to generate hooks. Please try again.'];
  } catch (error) {
    console.error('Error generating hooks:', error);
    return ['Error generating hooks. Please check your API configuration.'];
  }
};

export const generateScript = async (
  contentIdea: ContentIdea,
  selectedHook: string,
  apiProvider: string = 'openrouter',
  model: string = 'anthropic/claude-3.5-sonnet'
): Promise<string> => {
  try {
    const prompt = `Write a complete 2-2.5 minute video script for a short-form video in the Make Money Online/BizOps niche.

Content Idea: "${contentIdea.title}"
Selected Hook: "${selectedHook}"

Follow this exact structure:

**HOOK (0-3 seconds):**
${selectedHook}

**PROBLEM/PAIN POINT (3-15 seconds):**
Identify the main problem or pain point your audience faces related to this topic.

**SOLUTION/VALUE (15-90 seconds):**
Provide the main content, tips, or solution. Break this into 3-5 key points or steps.

**PROOF/CREDIBILITY (90-120 seconds):**
Add social proof, statistics, or personal experience to build credibility.

**CALL TO ACTION (120-150 seconds):**
End with a clear, compelling call to action.

Requirements:
- Write in a conversational, engaging tone
- Use "you" to speak directly to the viewer
- Include specific numbers, statistics, or examples where relevant
- Keep sentences short and punchy for video format
- Target entrepreneurs, side hustlers, and business-minded individuals
- Aim for 300-400 words total

Write the complete script now:`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEYS.OPENROUTER}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ReelWriterAI',
        },
      }
    );
    
    return response.data.choices[0]?.message?.content || 'Failed to generate script. Please try again.';
  } catch (error) {
    console.error('Error generating script:', error);
    return 'Error generating script. Please check your API configuration.';
  }
};

export const generateCaptions = async (
  script: string,
  apiProvider: string = 'openrouter',
  model: string = 'anthropic/claude-3.5-sonnet'
): Promise<{
  instagram: string;
  linkedin: string;
  youtube: string[];
}> => {
  try {
    const prompt = `You are a social media strategist trained in 2025 best practices for cross-platform content creation.

Based on the script provided below, write platform-specific captions and titles for:
- Instagram, Facebook, and Threads (grouped as one caption)
- LinkedIn
- YouTube (titles only)

🔹 Script:
${script}

🔹 Output Format:
1️⃣ 📲 Instagram / Facebook / Threads Caption
Hook in the first 80–100 characters
Brief story, insight, or lesson (~100–150 words max)
Use emojis for engagement
End with a clear call-to-action (e.g., "Save this," "Comment below," "Tag a friend")
Add exactly 9 hashtags in one line, using this strategy:
🔺 3 high-volume/broad hashtags
🎯 3 topic-specific medium-volume hashtags
🧠 3 niche-specific low-volume hashtags
Hashtags format: all in one line, no line breaks, separated by spaces

2️⃣ 💼 LinkedIn Caption
Professional tone with a strong hook or insight upfront
Expand with context or value
Add a single CTA (e.g., "What's working for you lately?", "Comment your thoughts")
Include up to 5 relevant hashtags at the end, formatted in a single line

3️⃣ 📺 Give me 10 YouTube Titles
Max 60 characters
Include clear keyword(s), curiosity, or a benefit
Use numbers if appropriate (e.g., "5 Ways to…" or "Top Tools for…")
Avoid clickbait`;

    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2000,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${API_KEYS.OPENROUTER}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': window.location.origin,
          'X-Title': 'ReelWriterAI',
        },
      }
    );
    
    const content = response.data.choices[0]?.message?.content || '';
    
    // Parse the response to extract different platform captions
    const instagramMatch = content.match(/1️⃣.*?Instagram.*?Caption([\s\S]*?)(?=2️⃣|$)/i);
    const linkedinMatch = content.match(/2️⃣.*?LinkedIn.*?Caption([\s\S]*?)(?=3️⃣|$)/i);
    const youtubeMatch = content.match(/3️⃣.*?YouTube.*?Title[s]?([\s\S]*?)$/i);
    
    const instagram = instagramMatch ? instagramMatch[1].trim() : 'Failed to generate Instagram caption';
    const linkedin = linkedinMatch ? linkedinMatch[1].trim() : 'Failed to generate LinkedIn caption';
    
    // Extract YouTube titles
    const youtubeContent = youtubeMatch ? youtubeMatch[1].trim() : '';
    const youtubeTitles = youtubeContent
      .split('\n')
      .filter(line => line.match(/^\d+\./))
      .map(line => line.replace(/^\d+\.\s*/, '').trim())
      .filter(title => title.length > 0)
      .slice(0, 10);
    
    return {
      instagram,
      linkedin,
      youtube: youtubeTitles.length > 0 ? youtubeTitles : ['Failed to generate YouTube titles'],
    };
  } catch (error) {
    console.error('Error generating captions:', error);
    return {
      instagram: 'Error generating Instagram caption',
      linkedin: 'Error generating LinkedIn caption',
      youtube: ['Error generating YouTube titles'],
    };
  }
};