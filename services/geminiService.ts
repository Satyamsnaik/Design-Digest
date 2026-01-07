
import { GoogleGenAI, Type } from "@google/genai";
import { Article, DigestConfig, UserPreferences } from "../types.ts";
import { FALLBACK_ARTICLES } from "../constants.ts";

// Switched to Flash model for faster inference and tool use
const MODEL_NAME = 'gemini-3-flash-preview';

/**
 * Clean JSON string if the model returns markdown code blocks or conversational text
 */
const cleanJsonString = (str: string): string => {
  let cleaned = str.trim();
  const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = cleaned.match(codeBlockRegex);
  if (match) {
    cleaned = match[1];
  } else {
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    let startIndex = -1;
    let endIndex = -1;

    if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
        startIndex = firstBracket;
        endIndex = cleaned.lastIndexOf(']');
    } else if (firstBrace !== -1) {
        startIndex = firstBrace;
        endIndex = cleaned.lastIndexOf('}');
    }

    if (startIndex !== -1 && endIndex !== -1) {
        cleaned = cleaned.substring(startIndex, endIndex + 1);
    }
  }
  return cleaned;
};

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

export async function fetchLiveDigest(config: DigestConfig, prefs?: UserPreferences): Promise<Article[]> {
  // Use direct process.env.API_KEY access as per guidelines
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
    Use Google Search to find ACTUAL, CURRENT URLs. Do not hallucinate links.
    
    Schema:
    [
      {
        "id": "uuid",
        "title": "Title",
        "author": "Author",
        "source": "Publication Name",
        "type": "Article" | "Video",
        "category": "Category",
        "url": "DIRECT_URL",
        "summary": ["Point 1 (Concise)", "Point 2 (Concise)", "Point 3 (Concise)"],
        "insights": ["Deep Insight 1", "Deep Insight 2", "Deep Insight 3"],
        "application_tips": ["Actionable Tip 1", "Actionable Tip 2", "Actionable Tip 3"],
        "tweet_draft": "Mental model hook -> Value prop."
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Optimize for speed by disabling thinking budget for this task
        thinkingConfig: { thinkingBudget: 0 }
      },
    });

    const text = response.text;
    if (!text) return FALLBACK_ARTICLES;
    return JSON.parse(cleanJsonString(text)) as Article[];
  } catch (error) {
    console.error("Gemini fetch failed:", error);
    return FALLBACK_ARTICLES;
  }
}

export async function analyzeUrl(url: string): Promise<Article> {
  // Use direct process.env.API_KEY access as per guidelines
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
    Analyze this URL: ${url}
    Act as a Product Designer. Extract core value and insights.
    
    OUTPUT FORMAT: Return a single JSON Article object.
    {
      "id": "uuid",
      "title": "Title",
      "author": "Author",
      "source": "Source",
      "type": "Article",
      "category": "Category",
      "url": "${url}",
      "summary": ["..."],
      "insights": ["..."],
      "application_tips": ["..."],
      "tweet_draft": "Insight hook."
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: { 
        tools: [{ googleSearch: {} }],
        // Optimize for speed
        thinkingConfig: { thinkingBudget: 0 }
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("Empty response");
    return JSON.parse(cleanJsonString(text)) as Article;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
}
