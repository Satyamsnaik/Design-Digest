import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

export default function ProjectSpec() {
  const [copied, setCopied] = useState(false);

  const promptText = `**Project Name:** Daily Design Digest

## Part 1: Context

"Daily Design Digest" is an AI-powered, editorial-style daily briefing application built specifically for Product Designers. Its primary purpose is to curate, summarize, and analyze design articles and videos dynamically using the Google Gemini API (model: \`gemini-3-flash-preview\`) paired with Google Search tool calling. The application acts as a personal, intelligent design researcher. It pulls real-world articles based on user parameters, avoids hallucinations by utilizing Search Grounding, and adapts to the user's tastes over time.

## Part 2: Detailed Specification

### 1. Tech Stack
- **Frontend Framework:** React 18 with TypeScript.
- **Build Tool:** Vite.
- **Styling:** Tailwind CSS (utilizing arbitrary design tokens and standard utility classes).
- **Icons:** \`lucide-react\`.
- **AI Integration:** \`@google/genai\` SDK for structured JSON generation and web search interactions.

### 2. Aesthetic and Styling Rules
- **Typography:** 
  - Uses **'Playfair Display'** for large, editorial display headlines, creating a high-end magazine feel.
  - Uses **'Outfit'** for clean, readable sans-serif body text and compact UI elements.
- **Colors:**
  - Background: Cream/Off-white (\`#FEFBF6\`) with a subtle radial gradient dot matrix pattern.
  - Text: High-contrast Charcoal (\`#1C1C1C\`).
  - Accents: Amber/Orange block tints highlight saved/active states.
- **UI Paradigm:** 
  - Merges pure, clean utility components with an editorial "Hero" layout. 
  - The navigation bar uses iOS-style glassmorphism (\`backdrop-blur-2xl\`, \`bg-white/40\`) floating at the top. 
  - Heavy reliance on soft rounded corners (\`rounded-xl\`, \`rounded-2xl\`, \`rounded-full\`).

### 3. State & Data Architecture
- **State Management:** Single Page Application (SPA) driven by local React state.
- **Views:** Dashboard (Home), Result Feed, Saved Articles, History, and Project Spec.
- **LocalStorage Usage:** 
  - \`ddd_history\` (Array spanning recent generated briefs).
  - \`ddd_saved\` (Bookmarked articles).
  - \`ddd_liked\` / \`ddd_disliked\` (Lists informing future AI responses).
- **SessionStorage:** Stores temporarily the \`GEMINI_API_KEY\` if provided via the settings modal.
- **Error Handling:** Implements a class-based \`SimpleErrorBoundary\` to softly catch crash states, displaying a themed "Reload App" fallback view.

### 4. Core Views & Components
1. **NavBar:** Floating at the top. A flex container with a pill-shaped layout holding Lucide icons (Home, Bookmark, History, Terminal, Settings). Features active state indicators and notification dots for saved items length.
2. **Dashboard (Home View):**
   - Features a massive typography header.
   - **Digest Configurator:** A section with dropdowns to select Experience Level, Design Topic (e.g., AI in UX, Visual Design), and Date Range. Hitting 'Generate' fires the AI request.
   - **Url Analyzer:** An input field allowing users to paste YouTube videos or external articles for an instant AI summary.
3. **Result Feed:**
   - Handles loading states via an elegant \`SkeletonLoader\` mapped to either 'feed' mode or 'url' mode.
   - Outputs a grid map of \`ArticleCard\` components. 
   - **Fallback Mode:** If the connection drops or API limits hit, it mounts an \`AlertTriangle\` alert panel and sets the UI to use predefined fallback data locally stored.
4. **ArticleCard Component:**
   - Header: pill-shaped category tag, source, and published date.
   - Main: Editorial, bold title with the standard author tag.
   - Body: Core 3-paragraph summary text.
   - Expandable Dropdown Sections: Displays "Key Insights" (exactly 5 bullet points) and "Application Tips" (exactly 5 actionable points).
   - Interactions: A bookmark saving toggle, and Thumbs Up / Thumbs Down voting buttons. 
5. **Saved Articles & History:**
   - **Saved:** Grid layout of all locally retained \`ArticleCard\` components.
   - **History:** List view displaying past generated requests with timestamps and topic tags. Clicking on any block repopulates the result view with that session's articles.
   - Both views feature an integrated dynamic search bar to fuzzy-filter title text, summary paragraphs, or tags locally.

### 5. AI Prompt Engineering Logic
- **Curation Method:** The prompt enforces finding exactly 4 unique URLs that match the user's configured timeline, topic, and seniority level parameters. 
- **Feedback Injection:** User likes and dislikes (from \`ddd_liked\` / \`ddd_disliked\`) are stringified and dynamically prepended to the prompt to force the LLM to lean towards preferred structural formats.
- **Output Schema:** Uses the Gen AI SDK's \`responseSchema\` with \`Type.OBJECT\` & \`Type.ARRAY\` to enforce standard outputs against the defined TypeScript interface: \`{ id, title, author, source, type, category, url, date, summary, insights, application_tips, tweet_draft }\`.
- **Search Logic Grounding:** By enabling \`tools: [{ googleSearch: {} }]\`, the LLM is forced to invoke internet access, actively crawling for current URLs and real links, thereby combating standard factual hallucination behaviors.`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20">
      <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm relative">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-charcoal mb-2 flex items-center gap-3">
              <Terminal className="text-stone-400 w-6 h-6" />
              Project Specification
            </h2>
            <p className="text-stone-500 font-sans text-sm md:text-base leading-relaxed max-w-2xl">
              This document contains a comprehensive description and blueprint of the Daily Design Digest architecture. You can use it as an AI prompt to rebuild this project, clone its exact UX, or deeply understand the codebase interactions.
            </p>
          </div>
          <button
            onClick={copyToClipboard}
            className="flex flex-shrink-0 items-center justify-center gap-2 px-5 py-2.5 bg-charcoal hover:bg-black text-white rounded-full transition-colors font-medium text-sm shadow-md hover:shadow-lg w-full md:w-auto"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied Prompt!' : 'Copy as Prompt'}
          </button>
        </div>

        <div className="bg-[#1C1C1C] rounded-xl p-5 md:p-8 overflow-x-auto shadow-inner">
          <pre className="text-stone-300 font-mono text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
            {promptText}
          </pre>
        </div>
      </div>
    </div>
  );
}
