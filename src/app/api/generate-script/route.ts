import { NextResponse } from "next/server";
import {
  callOpenAIChatCompletion,
  callGoogleGeminiChatCompletion,
  callAnthropicClaudeChatCompletion,
  callOpenRouterChatCompletion,
} from "@/lib/apiClients";

export async function POST(request: Request) {
  const { idea, hook, apiKey, model } = await request.json();

  if (!idea || !hook || !apiKey || !model) {
    return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
  }

  const prompt = `
You are an expert short-form video scriptwriter specializing in creating engaging and addictive scripts for platforms like TikTok, Instagram Reels, and YouTube Shorts, focusing on the "Make Money Online" and "Business Operations" niches.

Your task is to write a complete 2-minute video script based on the following content idea and winning hook.

Content Idea Title: "${idea.title}"
Content Idea Snippet: "${idea.snippet}"
Winning Hook: "${hook}"

Script Structure Requirements:
1. Hook (Already Provided): Start the script exactly with the winning hook: "${hook}".
2. Introduction (15-20 seconds): Expand on the problem or promise. Briefly explain why this topic is crucial for the viewer.
3. Main Body (90 seconds): Break down the core message into 3-5 clear, actionable, and easy-to-understand points or steps. Use simple language and avoid jargon. Each point should provide tangible value.
4. Call to Action (10-15 seconds): End with a strong, clear call to action encouraging viewers to comment, follow, or check a link.
5. Formatting: Use clear headings for each section (e.g., "[HOOK]", "[INTRODUCTION]", "[POINT 1]", "[CTA]"). Add visual cues or suggestions in parentheses, such as "(Show a screenshot of the app)" or "(Point to the text on screen)".

Storytelling Techniques to Apply:

1. The Dance (Context and Conflict):
- Step 1: Establish Context: Introduce the characters, setting, and initial situation. Provide enough background information for the viewer to understand what's happening and who is involved. Explanation: Context sets the stage for your story. It helps the audience connect with the characters and their goals.
- Step 2: Introduce Conflict: Introduce an obstacle, challenge, or problem that disrupts the initial context. This conflict should create tension and raise questions in the viewer's mind. Explanation: Conflict is the driving force of a story. It creates intrigue and makes the audience want to know what will happen next.
- Step 3: Alternate Between Context and Conflict: Continue to weave back and forth between context and conflict throughout your story. Each context section should build upon the previous one, and each conflict should escalate the tension. Explanation: This "dance" keeps the viewer engaged. Context helps them understand the situation, while conflict keeps them emotionally invested.
- Step 4: Use "But" and "Therefore": When outlining your story, use the words "but" and "therefore" to connect the beats of your narrative. "But" introduces a conflict or complication, while "therefore" shows the consequence of the previous action. Explanation: Using these words helps ensure that your story has a logical flow and that each event has a meaningful impact on the overall narrative.
- Step 5: Avoid "And Then": Avoid using "and then" to connect events, as this can create a monotonous and listless sequence of events. Explanation: "And then" suggests that one event simply follows another without a strong causal relationship, which can bore the audience.

2. Rhythm (Sentence Variety):
- Step 1: Vary Sentence Length: Use a combination of short, medium, and long sentences in your writing. Explanation: Sentence variety creates a natural rhythm and flow that is pleasing to the ear.
- Step 2: Avoid Monotonous Repetition: Be aware of the rhythm and flow of your sentences. Avoid having too many sentences of the same length in a row, as this can sound monotonous and predictable. Explanation: Predictable rhythm can cause the audience to lose interest and tune out.
- Step 3: Use Syllable Variety: Incorporate words with varying numbers of syllables. Explanation: Just like sentence length, syllable variety contributes to the overall musicality and interest of your language.
- Step 4: Visualize Your Script: Write each sentence of your script on a new line. When you look at the script, the lines should create a jagged edge, indicating varied sentence lengths. Explanation: This technique provides a visual check to ensure that your writing has sufficient rhythm and variety.

3. Tone (Conversational Style):
- Step 1: Adopt a Conversational Tone: Write and present your content as if you were speaking to a close friend. Explanation: A conversational tone creates a sense of intimacy and connection with the viewer, making them feel like they are part of a one-on-one conversation.
- Step 2: Break Down the Fourth Wall: Strive to make the viewer forget that they are watching a video. Eliminate the feeling that you are "selling" or "presenting" to them. Explanation: This helps to lower the viewer’s defenses and makes them more receptive to your message.
- Step 3: Practice and Repetition: The more you create content, the more natural your tone will become. Explanation: Tone develops over time with practice.
- Step 4: Use a Visual Aid: If needed, tape a picture of a friend near your camera lens to help you visualize speaking to someone you know. Explanation: This can help you maintain a conversational tone and make your delivery feel more personal.
- Step 5: Write Like You're Texting: When writing your script, imagine that you are composing a text message or recording a voice note to a friend. Explanation: This can help you to use more casual language and a relaxed tone.

4. Direction (Start with the End):
- Step 1: Determine the Ending: Before you begin writing your story, decide on the final message or takeaway. Explanation: Knowing your ending helps you to craft a narrative that builds towards a specific goal.
- Step 2: Craft a Memorable Last Line: Write a final line that is impactful and easy to share. Explanation: The last line should leave a lasting impression on the viewer.
- Step 3: Work Backwards: Once you have the ending, outline the events that need to happen to reach that conclusion. Explanation: This approach helps you create a cohesive and purposeful narrative.
- Step 4: Apply to Short-Form Content: In short-form video, remember that the last line often sets up the loop. Explanation: The ending should connect back to the beginning, encouraging viewers to watch again.
- Step 5: Fill in the Middle: After you have the beginning and ending, flesh out the details of the story's middle section. Explanation: This is where you develop the characters, build tension, and provide necessary context.

5. Story Lens (Unique Angle):
- Step 1: Identify Your Topic: Choose the subject matter of your story. Explanation: This is the basic subject of your video.
- Step 2: Recognize Common Angles: Consider the typical ways that others might approach the same topic. Explanation: This helps you identify clichés and avoid rehashing familiar perspectives.
- Step 3: Find Your Unique Lens: Determine your personal perspective, interpretation, or spin on the topic. What can you say that is different, fresh, or insightful? Explanation: Your story lens is what makes your content stand out and offers a unique value proposition to the audience.
- Step 4: Craft Your Story Through That Lens: Tell your story from the chosen unique perspective consistently. Explanation: This creates a distinctive voice and makes your content more memorable.

6. The Hook (Engaging Start):
- Step 1: Make Your First Line Punchy: Your very first sentence should be attention-grabbing and directly related to the main topic of your video. Explanation: In short-form video, you have very little time to capture attention, so make your opening line count.
- Step 2: Indicate the Plot: Give the viewer a clear idea of what the video is about in the hook. Explanation: This helps viewers quickly decide if they are interested in the content.
- Step 3: Avoid Opaque Openings: Don't start with vague or generic phrases like "Wait till you see this!" or "You'll never believe this!" Explanation: These types of openings are not specific enough to capture attention in today's fast-paced environment.
- Step 4: Use Visual Hooks: Incorporate compelling visuals in the first few seconds of your video. Explanation: Visuals are more effective than audio-only hooks because people process visual information faster.
- Step 5: Complement with Visuals: Make sure your visuals directly support and enhance what you are saying. Explanation: This creates a stronger impact and improves viewer comprehension.

7. Putting It All Together:
Integrate the Techniques: The most effective storytelling weaves together several of these techniques. For instance, you can use "The Dance" to structure your narrative, while employing "Rhythm" to enhance the flow and "Tone" to connect with your audience.
Practice Consistently: Storytelling is a skill that improves with practice. Regularly create content and analyze what resonates with your audience.
Seek Feedback: Share your stories with others and ask for constructive criticism. This can help you identify areas for improvement.
Study Master Storytellers: Analyze the work of filmmakers, writers, speakers, and other creators who are known for their storytelling abilities. Pay attention to how they use these techniques.
Be Authentic: Let your own personality and experiences shape your storytelling. Authenticity creates a stronger connection with the audience.
By consistently applying these detailed steps and explanations, you can develop your storytelling skills and create more engaging and impactful content.

Addictive Video Creation Principles:

1. The Psychology of Addiction:
- Understand Dopamine Loops: Addiction is rooted in dopamine loops in the brain. Actions that trigger dopamine release are reinforced, making the brain want to repeat those actions. Explanation: To create addictive content, you need to understand how to consistently trigger the dopamine reward system in viewers.
- Trigger Dopamine Release: Watching videos releases dopamine due to three factors: value, contrast, and relevance. Explanation: These three components are key to engineering stories that viewers find addictive.

2. The Three Components Driving Addictive Content:
- Value: Value is what the viewer gets out of the video (usefulness or entertainment). Videos can range from purely entertaining (like Mr. Beast) to purely useful (like how-to videos) or a mix of both. Explanation: The magnitude of value is what truly moves the needle in making a video addictive.
- Contrast: Contrast is the difference between the viewer's expectation and what they actually see in the video. Greater contrast leads to greater value and more dopamine release. Explanation: Videos that significantly exceed viewers' expectations are more likely to be addictive.
- Relevance: Relevance is how precisely the video targets the viewer's interests. The more relevant the video, the more valuable it is to that specific viewer. Explanation: To maximize addictiveness, you want high value targeted as precisely as possible at your ideal viewer.

3. Storytelling Technique 1: Value Compression:
- Opt-in Right Away: In the first 3-5 seconds, clearly state what the video is about. Explanation: This allows viewers to quickly decide if the video is relevant to them.
- Expose the Contrast Moment Early: Show the most dramatic or interesting element of the video as soon as possible. Explanation: This creates a rapid contrast between expectation and reality, hooking the viewer.

4. Storytelling Technique 2: Format Matching:
- Establish a Consistent Format: Create a signature style that is unique to your videos (visuals, pacing, etc.). Explanation: Consistent formatting creates a sense of familiarity and makes it easier for viewers to return to your content.
- Focus Viewer Attention: When the format is consistent, viewers can focus more of their attention on the content of the story. Explanation: This increased focus enhances the impact of contrast and makes the video more engaging.
- Emulate and Evolve: When developing your style, start by emulating creators you admire. Gradually, you will naturally develop your own unique variations. Explanation: This approach provides a starting point and helps overcome the challenge of creating a style from scratch.
- Use Visual Graphics: Incorporate motion graphics or other visuals to enhance comprehension. Explanation: Visuals can help viewers understand the story more clearly, increasing its impact.

5. Storytelling Technique 3: Story Flow:
- Prioritize Clarity: Ensure that your storytelling is clear and easy to follow. Explanation: Comprehension is essential for maximizing the impact of contrast and value.
- Simplify Your Message: Use simpler words and phrases to improve understanding. Explanation: Avoid complex language that could confuse viewers and reduce comprehension.
- Distill Your Script: Cut out unnecessary details and fluff to make your story more concise. Explanation: Shorter, more distilled stories are more impactful and engaging.
- Pressure Test Your Script: Evaluate each line of your script to ensure it is necessary and compelling. Explanation: This process helps to eliminate unnecessary elements and improve the flow of your story.

6. Storytelling Technique 4: Fun Wrapper:
- Entertain Your Audience: Make your storytelling enjoyable to listen to. Explanation: Even useful stories can be made more addictive by adding an element of fun.
- Increase Likeability: Inject energy, humor, and positivity into your delivery. Explanation: When viewers like you or the subject of your story, they are more likely to stay engaged.
- Enhance Comprehension: Likeability leads to viewer buy-in and increased focus, which in turn improves comprehension. Explanation: Greater comprehension results in more contrast, more value, and ultimately, more addictive videos.

7. Achieving Addictive Storytelling:
- Maximize Value: To make your videos addictive, focus on maximizing the value they provide to viewers. Explanation: The more value viewers perceive, the more dopamine is released, and the more likely they are to return for more.
- Target Your Audience: Refine your understanding of your ideal viewer to increase the relevance of your content. Explanation: Content that is highly relevant to a specific viewer is perceived as more valuable.
- Balance Usefulness and Entertainment: Determine where your video falls on the spectrum of usefulness and entertainment and optimize accordingly. Explanation: Both usefulness and entertainment contribute to value, so find the right balance for your target audience.
- Analyze and Adapt: Pay attention to viewer feedback and engagement metrics to understand what makes your videos addictive. Explanation: This ongoing analysis will help you refine your storytelling techniques and create even more compelling content.

Generate the script now, following these instructions carefully to create an engaging, rhythmic, conversational, and addictive short-form video script that fits the 2-minute format.
`;

  try {
    let generatedText = "";

    if (model.startsWith("openai/")) {
      const openAiModel = model.replace(/^openai\//, "");
      generatedText = await callOpenAIChatCompletion(apiKey, [{ role: "user", content: prompt }], openAiModel);
    } else if (model.startsWith("google/gemini")) {
      generatedText = await callGoogleGeminiChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else if (model.startsWith("anthropic/")) {
      generatedText = await callAnthropicClaudeChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    } else {
      generatedText = await callOpenRouterChatCompletion(apiKey, [{ role: "user", content: prompt }], model);
    }

    return NextResponse.json({ script: generatedText });

  } catch (err: unknown) {
    console.error("Error generating script:", err);
    const message = err instanceof Error ? err.message : "An internal error occurred while generating the script.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}