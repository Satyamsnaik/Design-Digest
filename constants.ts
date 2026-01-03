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
    title: 'Atomic Design',
    author: 'Brad Frost',
    source: 'Brad Frost Blog',
    type: 'Article',
    category: 'Design Systems',
    url: 'https://bradfrost.com/blog/post/atomic-web-design/',
    summary: [
      "Atomic design is a methodology for creating design systems.",
      "It breaks interfaces down into atoms, molecules, organisms, templates, and pages.",
      "This approach allows for more consistent and scalable UI development."
    ],
    insights: [
      "Systems should be built from the ground up (atoms to pages).",
      "Consistency in small parts leads to coherence in large pages.",
      "Vocabulary matters: shared naming conventions align teams."
    ],
    application_tips: [
      "Audit your current UI inventory.",
      "Start defining your atoms (buttons, inputs).",
      "Combine atoms to see if they work as molecules."
    ]
  },
  {
    id: 'fb_2',
    title: '10 Usability Heuristics for User Interface Design',
    author: 'Jakob Nielsen',
    source: 'NNGroup',
    type: 'Article',
    category: 'Research',
    url: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
    summary: [
      "Jakob Nielsen's 10 general principles for interaction design.",
      "They are called 'heuristics' because they are broad rules of thumb and not specific usability guidelines.",
      "These remain the most used framework for heuristic evaluation."
    ],
    insights: [
      "Visibility of system status builds trust.",
      "Match between system and the real world reduces cognitive load.",
      "User control and freedom prevents frustration."
    ],
    application_tips: [
      "Run a heuristic evaluation on your current project.",
      "Focus on error prevention before error recovery.",
      "Ensure your help documentation is easy to search."
    ]
  },
  {
    id: 'fb_3',
    title: 'The discipline of content strategy',
    author: 'Kristina Halvorson',
    source: 'A List Apart',
    type: 'Article',
    category: 'Strategy',
    url: 'https://alistapart.com/article/thedisciplineofcontentstrategy/',
    summary: [
      "Content strategy plans for the creation, publication, and governance of useful, usable content.",
      "It distinguishes between the 'editorial' strategy and the 'technical' strategy.",
      "Content must be treated as a business asset."
    ],
    insights: [
      "Content is not just copy; it's data and images too.",
      "Governance is often the missing link in strategy.",
      "Silos between design and content hurt the user experience."
    ],
    application_tips: [
      "Create a content audit spreadsheet.",
      "Define who owns what content after launch.",
      "Include real content in your wireframes, not Lorem Ipsum."
    ]
  },
  {
    id: 'fb_4',
    title: 'Design Systems 101',
    author: 'NNGroup',
    source: 'NNGroup',
    type: 'Article',
    category: 'Design Systems',
    url: 'https://www.nngroup.com/articles/design-systems-101/',
    summary: [
      "A design system is a set of standards to manage design at scale by reducing redundancy.",
      "It includes a pattern library and a style guide.",
      "The goal is to aid in digital product design and development."
    ],
    insights: [
      "Single source of truth is essential.",
      "Documentation is as important as the components.",
      "Adoption is the hardest part of a design system."
    ],
    application_tips: [
      "Start small with a UI kit before building a full system.",
      "Interview developers to see what they actually need.",
      "Don't over-engineer components early on."
    ]
  }
];