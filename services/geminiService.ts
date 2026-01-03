import { GoogleGenAI, Type } from "@google/genai";
import { Article, DigestConfig, ExperienceLevel, Topic, UserPreferences } from "../types";
import { FALLBACK_ARTICLES } from "../constants";

// 1. Initialize API
const apiKey = process.env.API_KEY || ''; 
// Note: In a real app, we check if key exists. 
// The prompt says "Assume this variable is pre-configured...".
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash-preview-09-2025';

// 2. Define Response Schema
// We define the schema for a single article and a list of articles to ensure strict JSON output.
const articleSchema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    title: { type: Type.STRING },
    author: { type: Type.STRING },
    source: { type: Type.STRING },
    type: { type: Type.STRING, enum: ["Article", "Video"] },
    category: { type: Type.STRING },
    url: { type: Type.STRING },
    summary: { type: Type.ARRAY, items: { type: Type.STRING } },
    insights: { type: Type.ARRAY, items: { type: Type.STRING } },
    application_tips: { type: Type.ARRAY, items: { type: Type.STRING } }
  },
  required: ["id", "title", "author", "source", "type", "category", "url", "summary", "insights", "application_tips"]
};

const digestSchema = {
  type: Type.ARRAY,
  items: articleSchema
};

/**
 * Helper to clean JSON string if the model returns markdown code blocks
 */
const cleanJsonString = (str: string): string => {
  let cleaned = str.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }
  return cleaned;
};

/**
 * Helper to construct preference string
 */
const getPreferenceContext = (prefs?: UserPreferences): string => {
  if (!prefs) return "";
  
  let context = "";
  if (prefs.likedArticles.length > 0) {
    const likedTitles = prefs.likedArticles.slice(0, 5).map(a => `"${a.title}" (${a.category})`).join(", ");
    context += `USER FEEDBACK - POSITIVE: The user previously found these articles helpful: ${likedTitles}. Prioritize similar topics, sources, or depth.\n`;
  }
  
  if (prefs.dislikedArticles.length > 0) {
    const dislikedTitles = prefs.dislikedArticles.slice(0, 5).map(a => `"${a.title}"`).join(", ");
    context += `USER FEEDBACK - NEGATIVE: The user disliked these articles: ${dislikedTitles}. Avoid similar content.\n`;
  }
  
  return context;
};

/**
 * Attempt 1: Search-Enabled Generation
 */
async function generateWithSearch(config: DigestConfig, prefs?: UserPreferences): Promise<Article[]> {
  const { level, topics } = config;
  
  const topicsStr = topics.includes('Random/Surprise Me') 
    ? "trending Product Design, UX Strategy, and UI Engineering topics"
    : topics.join(", ");

  const preferenceContext = getPreferenceContext(prefs);

  const prompt = `
    ACT AS: A Lead Product Designer.
    TASK: Active Web Search. Find 4 unique, high-quality, recent (last 6 months) articles or videos.
    TARGET AUDIENCE LEVEL: ${level}.
    TOPICS: ${topicsStr}.
    SOURCES TO SEARCH: UX Collective, Nielsen Norman Group, Smashing Magazine, A List Apart, The Futur, Growth.design, Reforge, Linear Blog, Figma Blog.
    
    ${preferenceContext}
    
    OUTPUT FORMAT: Return a JSON array of 4 Article objects.
    CRITICAL: In the 'application_tips' section, explain exactly 'How I can apply these learnings myself'. Be specific.
    
    The JSON structure must match this schema:
    [
      {
        "id": "uuid",
        "title": "Title",
        "author": "Author",
        "source": "Source Name",
        "type": "Article" | "Video",
        "category": "Topic Category",
        "url": "URL found",
        "summary": ["para1", "para2", "para3"],
        "insights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
        "application_tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
      }
    ]
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: digestSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Search generation");
    
    const parsed = JSON.parse(cleanJsonString(text));
    return parsed as Article[];
  } catch (error) {
    console.warn("Attempt 1 (Search) failed:", error);
    throw error;
  }
}

/**
 * Attempt 2: Knowledge Base Generation (No Search)
 */
async function generateFromKnowledgeBase(config: DigestConfig, prefs?: UserPreferences): Promise<Article[]> {
  const { level, topics } = config;
    const topicsStr = topics.includes('Random/Surprise Me') 
    ? "foundational Product Design concepts"
    : topics.join(", ");

  const preferenceContext = getPreferenceContext(prefs);

  const prompt = `
    ACT AS: A Lead Product Designer and Editor.
    TASK: Curate a reading list of 4 foundational/seminal design articles from your internal knowledge base.
    TARGET AUDIENCE LEVEL: ${level}.
    TOPICS: ${topicsStr}.
    
    ${preferenceContext}
    
    Since you cannot browse the live web right now, generate REAL, well-known articles that exist in your training data (e.g., from NNGroup, Baymard, famous Medium posts). Do not hallucinate fake URLs if possible, or use standard domain homepages if specific URL is unknown.

    OUTPUT FORMAT: Return a JSON array of 4 Article objects.
    CRITICAL: In the 'application_tips' section, explain exactly 'How I can apply these learnings myself'.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: digestSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from KB generation");
    
    const parsed = JSON.parse(cleanJsonString(text));
    return parsed as Article[];
  } catch (error) {
    console.warn("Attempt 2 (KB) failed:", error);
    throw error;
  }
}

/**
 * Main function to fetch digest with fallback chain
 */
export async function fetchLiveDigest(config: DigestConfig, prefs?: UserPreferences): Promise<Article[]> {
  // Attempt 1: Search
  try {
    const articles = await generateWithSearch(config, prefs);
    if (articles && articles.length > 0) return articles;
  } catch (e) { /* continue */ }

  // Attempt 2: Knowledge Base
  try {
    const articles = await generateFromKnowledgeBase(config, prefs);
    if (articles && articles.length > 0) return articles;
  } catch (e) { /* continue */ }

  // Attempt 3: Hardcoded Fallback
  console.warn("All AI attempts failed. Using fallback data.");
  // Randomly select 4 from fallback if we had more, but for now return all 4
  return FALLBACK_ARTICLES;
}

/**
 * URL Analyzer Service
 */
export async function analyzeUrl(url: string): Promise<Article> {
  const prompt = `
    ACT AS: A Lead Product Designer.
    TASK: Analyze the following content URL. Read it and generate a detailed summary card.
    URL: ${url}
    
    OUTPUT FORMAT: Return a SINGLE JSON Article object.
    
    Structure:
    {
      "id": "uuid",
      "title": "Title",
      "author": "Author",
      "source": "Source",
      "type": "Article" | "Video",
      "category": "Main Category",
      "url": "${url}",
      "summary": ["para1", "para2", "para3"],
      "insights": ["insight1", "insight2", "insight3", "insight4", "insight5"],
      "application_tips": ["tip1", "tip2", "tip3", "tip4", "tip5"]
    }
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: articleSchema,
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    
    const parsed = JSON.parse(cleanJsonString(text));
    return parsed as Article;
  } catch (error) {
    console.error("URL Analysis failed:", error);
    // Return a mock error article so the UI doesn't crash
    return {
      id: 'error_' + Date.now(),
      title: 'Analysis Failed',
      author: 'System',
      source: 'Internal',
      type: 'Article',
      category: 'Error',
      url: url,
      summary: ['We could not analyze this URL at the moment.', 'Please try again later or check the URL.', 'The AI service may be temporarily unavailable.'],
      insights: ['N/A'],
      application_tips: ['Try a different URL', 'Check your internet connection']
    };
  }
}
