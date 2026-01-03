
import { GoogleGenAI, Type } from "@google/genai";
import { Article, DigestConfig, ExperienceLevel, Topic, UserPreferences } from "../types";
import { FALLBACK_ARTICLES } from "../constants";

// Using Gemini 3 Pro for superior reasoning and tool use adherence to prevent broken links
const MODEL_NAME = 'gemini-3-pro-preview';

/**
 * Helper to get the AI instance with the user's stored key
 */
const getAiInstance = (): GoogleGenAI => {
  const apiKey = localStorage.getItem('ddd_api_key');
  if (!apiKey) {
    throw new Error("API Key not found. Please enter your key.");
  }
  return new GoogleGenAI({ apiKey });
};

// 2. Define Response Schema
// We define the schema for a single article and a list of articles to ensure strict JSON output.
// NOTE: We only use this for Knowledge Base generation. For Search, we use prompt engineering to avoid conflicts.
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
    application_tips: { type: Type.ARRAY, items: { type: Type.STRING } },
    tweet_draft: { type: Type.STRING }
  },
  required: ["id", "title", "author", "source", "type", "category", "url", "summary", "insights", "application_tips", "tweet_draft"]
};

const digestSchema = {
  type: Type.ARRAY,
  items: articleSchema
};

/**
 * Helper to clean JSON string if the model returns markdown code blocks or conversational text
 */
const cleanJsonString = (str: string): string => {
  let cleaned = str.trim();
  
  // Try to extract JSON from code blocks first
  const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
  const match = cleaned.match(codeBlockRegex);
  if (match) {
    cleaned = match[1];
  } else {
    // If no code blocks, try to find the first [ or { and the last ] or }
    const firstBrace = cleaned.indexOf('{');
    const firstBracket = cleaned.indexOf('[');
    
    let startIndex = -1;
    let endIndex = -1;

    // Determine if we are looking for an object or array
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
  const ai = getAiInstance();
  const { level, topics, dateRange } = config;
  
  let topicsStr = topics.includes('Random/Surprise Me') 
    ? "trending Product Design, UX Strategy, and UI Engineering topics"
    : topics.join(", ");

  // Explicitly prompt for redesigns if case studies are requested
  if (topics.some(t => t.includes('Case Studies'))) {
    topicsStr += ". Include detailed Product/UX Redesign case studies if available";
  }

  const preferenceContext = getPreferenceContext(prefs);

  const prompt = `
    ACT AS: A Lead Product Designer.
    TASK: Find 4 unique, high-quality articles or videos relevant to the topics.
    DATE CONSTRAINT: The articles MUST be published within: ${dateRange}.
    TARGET AUDIENCE LEVEL: ${level}.
    TOPICS: ${topicsStr}.
    PREFERRED SOURCES: Reputable design publications like UX Collective, NNGroup, Smashing Magazine, A List Apart, The Futur, Growth.design, Reforge, Linear Blog, Figma Blog, or similar high-quality industry voices.
    
    ${preferenceContext}
    
    OUTPUT FORMAT: 
    Return a RAW JSON array of 4 Article objects. 
    Do NOT include any conversational text outside the JSON.
    Ensure the JSON is valid and follows this schema exactly:
    
    [
      {
        "id": "uuid",
        "title": "Title",
        "author": "Author",
        "source": "Source Name",
        "type": "Article" | "Video",
        "category": "Topic Category",
        "url": "THE_EXACT_SOURCE_URL_FOUND_BY_SEARCH",
        "summary": ["para1", "para2", "para3"],
        "insights": ["insight1", "insight2", "insight3", "insight4", "insight5", "insight6"],
        "application_tips": ["tip1", "tip2", "tip3", "tip4", "tip5", "tip6"],
        "tweet_draft": "Write a high-signal, intellectual tweet (<280 chars) sharing the specific mental model or insight. Style: Provocative hook -> Core value. No hashtags. Do NOT include the URL."
      }
    ]

    CRITICAL RULES FOR URL ACCURACY:
    1. You MUST use the Google Search tool to find these articles.
    2. The 'url' field MUST be the EXACT, FUNCTIONAL URL returned by the Google Search tool grounding.
    3. DO NOT fabricate, hallucinate, or guess URLs. Do NOT construct URLs (e.g. 'medium.com/author/title').
    4. If the search result does not explicitly provide a direct link to the article, DISCARD that item.
    5. Do NOT use search result pages (google.com/search?...) or truncated URLs.
    6. Quality over quantity: If you can only find 2 or 3 articles with VERIFIED URLs, return only those.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // We do NOT use responseSchema here because it conflicts with Search grounding in some cases
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
 * Attempt 2: Fallback Broad Search
 * If strict date/topic search fails, we try a broader search for timeless/popular content
 * We still use Search to ensure links are valid.
 */
async function generateBroadSearch(config: DigestConfig, prefs?: UserPreferences): Promise<Article[]> {
  const ai = getAiInstance();
  const { level, topics } = config;
    
  let topicsStr = topics.includes('Random/Surprise Me') 
    ? "foundational Product Design concepts"
    : topics.join(", ");
  
  if (topics.some(t => t.includes('Case Studies'))) {
    topicsStr += " (including famous redesign case studies)";
  }

  const preferenceContext = getPreferenceContext(prefs);

  const prompt = `
    ACT AS: A Lead Product Designer and Editor.
    TASK: Find 4 classic, seminal, or highly popular design articles/videos that are timeless.
    TARGET AUDIENCE LEVEL: ${level}.
    TOPICS: ${topicsStr}.
    
    ${preferenceContext}
    
    INSTRUCTIONS:
    1. Use Google Search to find reputable articles from sources like NNGroup, Baymard, Smashing Magazine, or A List Apart.
    2. Ensure the URLs are valid and functional.
    
    OUTPUT FORMAT: Return a JSON array of 4 Article objects.
    
    [
      {
        "id": "uuid",
        "title": "Title",
        "author": "Author",
        "source": "Source Name",
        "type": "Article" | "Video",
        "category": "Topic Category",
        "url": "THE_EXACT_URL",
        "summary": ["para1"],
        "insights": ["insight1"],
        "application_tips": ["tip1"],
        "tweet_draft": "Write a high-signal, intellectual tweet (<280 chars). Style: Provocative hook -> Core value. No hashtags. Do NOT include the URL."
      }
    ]
    
    CRITICAL: 
    - The 'url' must be extracted directly from the search tool.
    - Do not guess links. 
    - Do not output broken links.
    - If a link cannot be verified by the search tool, do not include the article.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }], // Enable search here too to fix broken links issue
      },
    });

    const text = response.text;
    if (!text) throw new Error("No text returned from Broad Search generation");
    
    const parsed = JSON.parse(cleanJsonString(text));
    return parsed as Article[];
  } catch (error) {
    console.warn("Attempt 2 (Broad Search) failed:", error);
    throw error;
  }
}

/**
 * Main function to fetch digest with fallback chain
 */
export async function fetchLiveDigest(config: DigestConfig, prefs?: UserPreferences): Promise<Article[]> {
  try {
    // Attempt 1: Search (Strict Constraints)
    try {
      const articles = await generateWithSearch(config, prefs);
      if (articles && articles.length > 0) return articles;
    } catch (e) { 
      console.log("Primary search failed, trying broad search...", e);
    }

    // Attempt 2: Broad Search (Relaxed Constraints, but still verifying links)
    try {
      const articles = await generateBroadSearch(config, prefs);
      if (articles && articles.length > 0) return articles;
    } catch (e) {
      console.log("Broad search failed, using hardcoded fallback.", e);
    }

    // Attempt 3: Hardcoded Fallback
    console.warn("All AI attempts failed. Using fallback data.");
    return FALLBACK_ARTICLES;
  } catch (finalError) {
      console.error("Critical failure in service:", finalError);
      throw finalError; // Rethrow so UI can handle (or show Key error)
  }
}

/**
 * URL Analyzer Service - Two-Step Robustness
 */
export async function analyzeUrl(url: string): Promise<Article> {
  const ai = getAiInstance();
  const commonInstructions = `
    OUTPUT FORMAT: 
    Return a SINGLE RAW JSON Article object.
    Do NOT include any conversational text.
    
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
      "insights": ["insight1", "insight2", "insight3", "insight4", "insight5", "insight6"],
      "application_tips": ["tip1", "tip2", "tip3", "tip4", "tip5", "tip6"],
      "tweet_draft": "Write a high-signal, intellectual tweet (<280 chars) about this specific resource. Focus on the core mental model or 'aha' moment. Style: Hook -> Insight. No hashtags. Do NOT include the URL."
    }

    CRITICAL: In the 'insights' and 'application_tips' sections, provide COMPREHENSIVE lists. Do NOT limit to 3 items. Aim for 5-7 distinct, valuable points.
  `;

  // STEP 1: Try with Search
  try {
    const prompt = `
      ACT AS: A Lead Product Designer.
      TASK: Analyze the content at this URL: ${url}
      
      INSTRUCTIONS:
      1. Use the Google Search tool to find the content of this page. 
      2. If the URL is not directly accessible, search for the title + author to find the content.
      3. Synthesize a detailed summary and analysis.
      
      ${commonInstructions}
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // No schema here to allow tool use flexibility
      },
    });
    
    const text = response.text;
    if (!text) throw new Error("No analysis returned");
    
    const parsed = JSON.parse(cleanJsonString(text));
    parsed.url = url; 
    return parsed as Article;

  } catch (searchError) {
    console.warn("URL Analysis (Search) failed, retrying with Inference...", searchError);
    
    // STEP 2: Retry without Search (Inference/Knowledge Base)
    // This prevents the "Analysis Failed" screen by falling back to what the model knows or can infer.
    try {
      const prompt = `
        ACT AS: A Lead Product Designer.
        TASK: Analyze this URL: ${url}
        
        It seems the live search for this URL failed. 
        Please infer the likely content based on the URL structure, keywords, or your internal knowledge base if it's a famous article.
        
        If you really cannot guess the specific content, provide a "Best Practices" guide for the TOPIC referenced in the URL string.
        Mark the source as "AI Inference".
        
        ${commonInstructions}
      `;

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: articleSchema, // We can use strict schema here since no tools are used
        },
      });

      const text = response.text;
      if (!text) throw new Error("No fallback analysis returned");

      const parsed = JSON.parse(cleanJsonString(text));
      parsed.url = url;
      return parsed as Article;
      
    } catch (fallbackError) {
      console.error("All URL Analysis attempts failed:", fallbackError);
      
      // Final Fallback to prevent crash
      return {
        id: 'error_' + Date.now(),
        title: 'Analysis Unavailable',
        author: 'System',
        source: 'Internal',
        type: 'Article',
        category: 'Error',
        url: url,
        summary: ['We could not analyze this URL at the moment.', 'Please try again later or check the URL.'],
        insights: ['N/A'],
        application_tips: ['Try a different URL', 'Check your internet connection'],
        tweet_draft: "Check out this link!"
      };
    }
  }
}
