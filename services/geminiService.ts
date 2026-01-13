
import { GoogleGenAI, Type } from "@google/genai";
import { Article, DigestConfig, UserPreferences } from "../types.ts";
import { FALLBACK_ARTICLES } from "../constants.ts";

// Switched to Flash model for faster inference and tool use
const MODEL_NAME = 'gemini-3-flash-preview';

const getPreferenceContext = (prefs?: UserPreferences): string => {
  if (!prefs) return "";
  let context = "";
  if (prefs.likedArticles.length > 0) {
    const likedTitles = prefs.likedArticles.slice(0, 5).map(a => `"${a.title}"`).join(", ");
    context += `USER FEEDBACK - POSITIVE: User liked: ${likedTitles}. Prioritize similar quality/depth.\n`;
  }
  if (prefs.dislikedArticles.length > 0) {
    const dislikedTitles = prefs.dislikedArticles.slice(0, 5).map(a => `"${a.title}"`).join(", ");
    context += `USER FEEDBACK - NEGATIVE: User disliked: ${dislikedTitles}. Avoid similar content.\n`;
  }
  return context;
};

const articleSchema = {
    type: Type.OBJECT,
    properties: {
        id: { type: Type.STRING },
        title: { type: Type.STRING },
        author: { type: Type.STRING },
        source: { type: Type.STRING },
        type: { type: Type.STRING },
        category: { type: Type.STRING },
        url: { type: Type.STRING },
        date: { type: Type.STRING },
        summary: { type: Type.ARRAY, items: { type: Type.STRING } },
        insights: { type: Type.ARRAY, items: { type: Type.STRING } },
        application_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
        tweet_draft: { type: Type.STRING }
    },
    required: ["id", "title", "author", "source", "type", "category", "url", "summary", "insights", "application_tips"],
};

export async function fetchLiveDigest(config: DigestConfig, prefs?: UserPreferences): Promise<Article[]> {
  // Guidelines: API key must be obtained exclusively from process.env.API_KEY and used directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { level, topics, dateRange } = config;
  
  const topicsStr = topics.join(", ");
  const preferenceContext = getPreferenceContext(prefs);

  const prompt = `
    ACT AS: A World-Class Senior Product Design Lead and Curator.
    TASK: Find 4 unique, high-quality design articles or videos.
    
    STRICT CONSTRAINTS:
    1. DATE: Published within ${dateRange}.
    2. LEVEL: ${level} (If Senior: avoid generic 101 content, look for deep dives, case studies, and strategy).
    3. TOPICS: ${topicsStr}.
    4. QUALITY: Sources must be reputable (e.g., NNGroup, A List Apart, Smashing Mag, Case Studies, Substack leaders).
    ${preferenceContext}
    
    OUTPUT FORMAT: Return a valid JSON array of 4 Article objects. 
    IMPORTANT: For EVERY article, you MUST generate EXACTLY 5 distinct 'insights' and EXACTLY 5 distinct 'application_tips'.
    Use Google Search to find ACTUAL, CURRENT URLs.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
            type: Type.ARRAY,
            items: articleSchema
        },
        // Optimize for speed by disabling thinking budget for this task
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text;
    if (!text) return FALLBACK_ARTICLES;
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText) as Article[];
  } catch (error) {
    console.error("Gemini fetch failed:", error);
    return FALLBACK_ARTICLES;
  }
}

export async function analyzeUrl(url: string): Promise<Article> {
  // Guidelines: API key must be obtained exclusively from process.env.API_KEY and used directly.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const isYoutube = url.toLowerCase().includes('youtube') || url.toLowerCase().includes('youtu.be');
  
  let contextInstruction = "";
  if (isYoutube) {
    contextInstruction = `
      CONTEXT: This is a YouTube video URL.
      CRITICAL: You MUST use Google Search to find the *actual* video title, description, and transcript/content.
      - Query suggestion: "summary of youtube video ${url}" or search for the video ID.
      - Do not hallucinate. If you cannot find the specific video content via search, state that in the summary.
      - 'application_tips' should be step-by-step instructions derived from the video content.
      - Ensure the 'type' field is set to 'Video'.
    `;
  } else {
    contextInstruction = `
      CONTEXT: This is a web article.
      CRITICAL: You MUST use Google Search to find the *actual* article content.
      - Verify the content matches the URL.
      - Extract the core content.
      - Ensure the 'type' field is set to 'Article'.
    `;
  }

  const prompt = `
    Analyze this specific URL: ${url}
    
    Act as a Product Designer & Technical Lead. 
    Your goal is to accurately extract the content from the provided URL and analyze it.
    
    ${contextInstruction}
    
    REQUIREMENTS:
    1. Summary: 3 concise paragraphs describing the actual content found.
    2. Insights: Extract EXACTLY 5 distinct core insights.
    3. Application Tips: Generate EXACTLY 5 actionable, practical steps.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        // Removed thinkingConfig: { thinkingBudget: 0 } to allow better tool usage for specific URL analysis
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response");
    const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText) as Article;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
