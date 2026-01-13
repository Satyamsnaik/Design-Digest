
import { GoogleGenAI, Type } from "@google/genai";
import { Article, DigestConfig, UserPreferences } from "../types.ts";
import { FALLBACK_ARTICLES } from "../constants.ts";

// Switched to Flash model for faster inference and tool use
const MODEL_NAME = 'gemini-3-flash-preview';

const getApiKey = (): string | undefined => {
  return process.env.API_KEY;
}

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
  const apiKey = getApiKey();
  if (!apiKey) {
    console.error("No API Key found");
    throw new Error("Missing API Key");
  }

  const ai = new GoogleGenAI({ apiKey });
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
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("Missing API Key");
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
    Analyze this URL: ${url}
    Act as a Product Designer. Extract core value and insights.
    
    REQUIREMENTS:
    1. Summary: 3 concise paragraphs.
    2. Insights: Extract EXACTLY 5 distinct core insights (mental models, facts, or strategic takeaways).
    3. Application Tips: Generate EXACTLY 5 actionable, practical steps for a designer to apply this knowledge.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: articleSchema,
        // Optimize for speed
        thinkingConfig: { thinkingBudget: 0 }
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
