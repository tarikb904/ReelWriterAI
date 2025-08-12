import { ContentIdea } from '../types';

export const HOOK_GENERATION_PROMPT = (contentIdea: ContentIdea) => `
You are an expert copywriter specializing in short-form video content for the Make Money Online and Business Operations niche.

Based on this viral content idea, generate 10 powerful hooks that will stop viewers from scrolling and make them watch the entire video.

Content Idea: "${contentIdea.title}"
Description: "${contentIdea.snippet}"
Source: ${contentIdea.source}

Each hook should:
1. Be 8-15 words maximum
2. Create immediate curiosity or urgency
3. Promise a specific benefit or transformation
4. Use power words that trigger emotion
5. Be relevant to entrepreneurs, side hustlers, and business builders

Hook Types to Include:
- Question hooks (2-3)
- Number/List hooks (2-3) 
- Controversial/Bold statement hooks (2-3)
- Story/Personal hooks (1-2)
- Problem/Solution hooks (1-2)

Format: Return exactly 10 hooks, numbered 1-10, with no additional text or explanations.

Example format:
1. [Hook text here]
2. [Hook text here]
...and so on.
`;

export const SCRIPT_GENERATION_PROMPT = (contentIdea: ContentIdea, selectedHook: string) => `
You are a professional scriptwriter for short-form business content. Write a complete 2-2.5 minute video script following this exact structure:

**CONTENT DETAILS:**
- Topic: ${contentIdea.title}
- Hook: ${selectedHook}
- Niche: Make Money Online / Business Operations
- Target: Entrepreneurs, side hustlers, business builders

**SCRIPT STRUCTURE (Follow exactly):**

**HOOK (0-3 seconds):**
${selectedHook}

**PROBLEM AGITATION (3-15 seconds):**
Identify and agitate the main problem your audience faces. Make them feel the pain.

**SOLUTION PREVIEW (15-25 seconds):**
Tease the solution you're about to share. Build anticipation.

**MAIN CONTENT (25-100 seconds):**
Deliver 3-5 actionable steps, tips, or insights. Be specific and valuable.

**SOCIAL PROOF (100-120 seconds):**
Add credibility with stats, examples, or brief success stories.

**CALL TO ACTION (120-150 seconds):**
Strong, clear CTA that drives engagement.

**WRITING REQUIREMENTS:**
- Conversational, direct tone
- Use "you" to address viewer personally
- Short, punchy sentences (5-12 words average)
- Include specific numbers and examples
- 350-450 words total
- Write for spoken delivery, not reading

Write the complete script now, following the structure above exactly.
`;

export const CAPTION_GENERATION_PROMPT = (script: string) => `
You are a social media content strategist specializing in 2025 platform best practices.

Create optimized captions for Instagram/Facebook/Threads, LinkedIn, and YouTube titles based on this video script:

**SCRIPT:**
${script}

**OUTPUT FORMAT (Follow exactly):**

**1️⃣ INSTAGRAM / FACEBOOK / THREADS CAPTION:**
- Hook in first 80-100 characters
- Value-packed middle section (100-150 words max)
- Use relevant emojis for engagement
- Clear call-to-action
- Exactly 9 hashtags in one line:
  * 3 high-volume broad hashtags
  * 3 topic-specific medium hashtags  
  * 3 niche-specific low hashtags

**2️⃣ LINKEDIN CAPTION:**
- Professional tone with strong opening
- Expand with context and value
- Single clear CTA
- Maximum 5 hashtags in one line
- 150-200 words total

**3️⃣ YOUTUBE TITLES (10 titles):**
- Maximum 60 characters each
- Include keywords and benefits
- Use numbers when appropriate
- Create curiosity without clickbait
- Target business/entrepreneurship keywords

Generate all three sections now, following the format exactly.
`;

export const HOOK_WRITING_GUIDELINES = `
**HOOK WRITING FRAMEWORK:**

**The 4-Second Rule:**
Your hook must capture attention within 4 seconds or viewers scroll away.

**Hook Types That Work:**

1. **Question Hooks**
   - "What if I told you..."
   - "Ever wonder why..."
   - "Ready to discover..."

2. **Number/List Hooks**
   - "3 secrets that..."
   - "The 5-step method..."
   - "7 mistakes costing you..."

3. **Controversial Hooks**
   - "Everyone's wrong about..."
   - "The truth they don't want..."
   - "Stop doing this immediately..."

4. **Story Hooks**
   - "Last month I discovered..."
   - "My biggest mistake was..."
   - "This changed everything..."

5. **Problem/Solution Hooks**
   - "Struggling with... Here's why"
   - "If you're tired of..."
   - "The real reason you're not..."

**Power Words for Hooks:**
- Secret, Hidden, Revealed
- Mistake, Wrong, Truth
- Instant, Fast, Quick
- Proven, Guaranteed, Tested
- Shocking, Surprising, Crazy

**Hook Testing Criteria:**
✅ Creates immediate curiosity
✅ Promises specific value
✅ Relevant to target audience
✅ Under 15 words
✅ Emotionally engaging
`;

export const SCRIPT_WRITING_GUIDELINES = `
**SCRIPT WRITING FRAMEWORK:**

**Structure Breakdown:**

**HOOK (0-3 seconds):**
- Grab attention immediately
- Promise value or create curiosity
- Set expectation for what's coming

**PROBLEM (3-15 seconds):**
- Identify viewer's pain point
- Agitate the problem
- Make them feel understood

**SOLUTION PREVIEW (15-25 seconds):**
- Tease what you'll teach
- Build anticipation
- Keep them watching

**MAIN CONTENT (25-100 seconds):**
- Deliver promised value
- 3-5 specific, actionable points
- Use examples and specifics
- Keep it practical

**PROOF (100-120 seconds):**
- Add credibility
- Share results or stats
- Brief success story

**CTA (120-150 seconds):**
- Clear next step
- Create urgency
- Drive engagement

**Writing Best Practices:**
- Write like you speak
- Use short sentences
- Include specific numbers
- Address viewer directly ("you")
- Maintain energy throughout
- End with strong CTA
`;