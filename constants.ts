import { Article, Topic } from './types';

export const AVAILABLE_TOPICS: Topic[] = [
  'Product Thinking',
  'AI in UX',
  'Visual Design',
  'Strategy',
  'Design Systems',
  'Research',
  'Random/Surprise Me'
];

export const DESIGN_QUOTES = [
  { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
  { text: "Good design is obvious. Great design is transparent.", author: "Joe Sparano" },
  { text: "Styles come and go. Good design is a language, not a style.", author: "Massimo Vignelli" },
  { text: "Design adds value faster than it adds costs.", author: "Joel Spolsky" },
  { text: "The details are not the details. They make the design.", author: "Charles Eames" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Accessible design is good design.", author: "Steve Ballmer" }
];

export const FALLBACK_ARTICLES: Article[] = [
  {
    id: 'fb_1',
    title: 'The Evolution of Design Systems in 2024',
    author: 'Brad Frost',
    source: 'Big Medium',
    type: 'Article',
    category: 'Design Systems',
    url: 'https://bradfrost.com/blog/post/design-systems-2024/',
    summary: [
      "Design systems are moving beyond simple component libraries to become integrated orchestration engines for product development.",
      "The article explores how AI is reshaping the contribution model, allowing for automated documentation and token generation.",
      "A shift from 'consistency' to 'coherence' is identified as the primary goal for mature design organizations."
    ],
    insights: [
      "Atomic Design 2.0 incorporates AI-driven component variations.",
      "Tokens are now the primary source of truth, not Figma files.",
      "Governance is shifting from policing to enabling rapid experimentation.",
      "Multi-brand systems are becoming the norm for enterprise orgs.",
      "Headless design systems allow for better framework agnosticism."
    ],
    application_tips: [
      "Audit your current token structure to ensure it supports multi-mode theming.",
      "In your next retro, discuss if your system is blocking or enabling creativity.",
      "Start documenting 'intent' alongside component specs.",
      "Experiment with AI tools to generate variant permutations.",
      "Create a 'contribution guide' that treats developers as primary users."
    ]
  },
  {
    id: 'fb_2',
    title: 'AI-First Design Patterns',
    author: 'Luke Wroblewski',
    source: 'A List Apart',
    type: 'Article',
    category: 'AI in UX',
    url: 'https://alistapart.com/article/ai-first-patterns/',
    summary: [
      "Traditional UI patterns based on direct manipulation are being challenged by intent-based interfaces.",
      "The 'black box' problem of AI requires new feedback loops to build user trust and manage expectations.",
      "This piece outlines 5 key patterns for generative UI: Suggestion, Curated Options, Co-creation, Refinement, and Explainability."
    ],
    insights: [
      "Users prefer 'curated options' over 'blank canvas' when using AI.",
      "Latency can be masked by 'thinking' states that educate the user.",
      "Error states in AI must be conversational and restorative.",
      "The command bar is replacing the navigation menu.",
      "Context retention is the single biggest UX challenge in chat interfaces."
    ],
    application_tips: [
      "When designing chat, always include 'suggested prompts' to reduce cognitive load.",
      "Add a 'Regenerate' or 'Refine' control near every AI output.",
      "Ensure your loading states clearly communicate what the AI is 'thinking'.",
      "Test your UI with 'hallucination' scenarios—what happens if the data is wrong?",
      "Design for variable height content blocks as AI output length is unpredictable."
    ]
  },
  {
    id: 'fb_3',
    title: 'Metric-Driven Design Strategy',
    author: 'Julie Zhuo',
    source: 'The Looking Glass',
    type: 'Article',
    category: 'Strategy',
    url: 'https://lg.substack.com/',
    summary: [
      "Connecting design outcomes to business KPIs is the defining skill of senior product designers.",
      "The article distinguishes between 'vanity metrics' (like clicks) and 'impact metrics' (like retention and revenue impact).",
      "It provides a framework for mapping user journey steps to specific, measurable business goals."
    ],
    insights: [
      "Designers must speak the language of 'conversion' and 'retention'.",
      "North Star metrics should align the entire product team, not just product managers.",
      "Qualitative data explains the 'why' behind the quantitative 'what'.",
      "A/B testing should be used for optimization, not vision setting.",
      "Leading indicators (usage) predict lagging indicators (revenue)."
    ],
    application_tips: [
      "In your next design review, explicitly state the metric you expect to move.",
      "Ask your PM for the 'data dashboard' related to your feature.",
      "Map your current project to the company's Q3 OKRs.",
      "Stop reporting 'usability success rates' to execs; report 'time saved'.",
      "Create a hypothesis statement for every major design decision."
    ]
  },
  {
    id: 'fb_4',
    title: 'Psychology of Dark Mode',
    author: 'Nielsen Norman Group',
    source: 'NNGroup',
    type: 'Video',
    category: 'Visual Design',
    url: 'https://www.nngroup.com/articles/dark-mode/',
    summary: [
      "Dark mode isn't just an aesthetic choice; it has significant implications for accessibility and battery life.",
      "The video breaks down the contrast ratios required for readable dark interfaces.",
      "It warns against pure black backgrounds which can cause 'smearing' on OLED screens."
    ],
    insights: [
      "Avoid pure black (#000000); use dark gray (#121212) for better depth.",
      "Elevation in dark mode is depicted by lightness, not shadow.",
      "Text weight may need to be decreased in dark mode to prevent visual vibration.",
      "Desaturate primary colors to avoid eye strain.",
      "Dark mode can actually reduce readability for users with astigmatism."
    ],
    application_tips: [
      "Check your contrast ratios specifically for your dark theme palette.",
      "Create a semantic color token named 'surface-0' through 'surface-5'.",
      "Test your dark mode in a brightly lit room to check for glare issues.",
      "Ensure images have a slight opacity reduction or overlay in dark mode.",
      "Don't invert shadows; use lighter surfaces to show depth."
    ]
  }
];