
import { Article, Topic } from './types.ts';

export const AVAILABLE_TOPICS: Topic[] = [
  'Product Thinking',
  'AI in UX',
  'Visual Design',
  'Strategy',
  'Design Systems',
  'Research',
  'Product Design Case Studies',
  'UX Design Case Studies',
  'Random/Surprise Me'
];

export const DESIGN_QUOTES = [
  { text: "Design is not just what it looks like and feels like. Design is how it works.", author: "Steve Jobs" },
  { text: "Good design is obvious. Great design is transparent.", author: "Joe Sparano" },
  { text: "Styles come and go. Good design is a language, not a style.", author: "Massimo Vignelli" },
  { text: "Design adds value faster than it adds costs.", author: "Joel Spolsky" },
  { text: "The details are not the details. They make the design.", author: "Charles Eames" },
  { text: "Simplicity is the ultimate sophistication.", author: "Leonardo da Vinci" },
  { text: "Accessible design is good design.", author: "Steve Ballmer" },
  { text: "If you think good design is expensive, you should look at the cost of bad design.", author: "Ralf Speth" },
  { text: "Perfection is achieved not when there is nothing more to add, but when there is nothing left to take away.", author: "Antoine de Saint-Exupéry" },
  { text: "Design is intelligence made visible.", author: "Alina Wheeler" },
  { text: "Everything is designed. Few things are designed well.", author: "Brian Reed" },
  { text: "People ignore design that ignores people.", author: "Frank Chimero" },
  { text: "Design is the silent ambassador of your brand.", author: "Paul Rand" },
  { text: "Digital design is like painting, except the paint never dries.", author: "Neville Brody" },
  { text: "Whitespace is like air: it is necessary for design to breathe.", author: "Wojciech Zieliński" },
  { text: "Recognizing the need is the primary condition for design.", author: "Charles Eames" }
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
    date: 'June 10, 2013',
    summary: [
      "Atomic design is a methodology for creating design systems.",
      "It breaks interfaces down into atoms, molecules, organisms, templates, and pages.",
      "This approach allows for more consistent and scalable UI development."
    ],
    insights: [
      "Systems should be built from the ground up (atoms to pages) rather than screen-down.",
      "Consistency in small parts leads to coherence in large pages.",
      "Vocabulary matters: shared naming conventions align designers and developers.",
      "Organisms are distinct sections of an interface that can be reused across templates.",
      "The 'Pages' stage is critical for testing the resilience of the system with real content."
    ],
    application_tips: [
      "Audit your current UI inventory to find inconsistencies.",
      "Start defining your atoms (buttons, inputs, labels).",
      "Combine atoms to see if they work as functional molecules.",
      "Stop designing full pages immediately; design the components first.",
      "Use the chemistry analogy to explain the system value to stakeholders."
    ],
    tweet_draft: "Most design systems fail because they focus on pages, not patterns.\n\nAtomic Design flips the model: Atoms → Molecules → Organisms.\n\nStop building screens. Start building systems."
  },
  {
    id: 'fb_2',
    title: '10 Usability Heuristics for User Interface Design',
    author: 'Jakob Nielsen',
    source: 'NNGroup',
    type: 'Article',
    category: 'Research',
    url: 'https://www.nngroup.com/articles/ten-usability-heuristics/',
    date: 'November 15, 2020',
    summary: [
      "Jakob Nielsen's 10 general principles for interaction design.",
      "They are called 'heuristics' because they are broad rules of thumb and not specific usability guidelines.",
      "These remain the most used framework for heuristic evaluation."
    ],
    insights: [
      "Visibility of system status builds trust by keeping users informed.",
      "Match between system and the real world reduces cognitive load via familiar language.",
      "User control and freedom prevents frustration when mistakes happen.",
      "Consistency and standards ensure users don't have to wonder if different words mean the same thing.",
      "Recognition rather than recall minimizes the memory load on the user."
    ],
    application_tips: [
      "Run a heuristic evaluation on your current project before user testing.",
      "Focus on error prevention messages rather than just error recovery.",
      "Ensure your help documentation is easy to search and task-focused.",
      "Check that your 'Undo' and 'Redo' states are clearly visible.",
      "Use real-world metaphors (like a trash can) to make UI intuitive."
    ],
    tweet_draft: "You don't need a PhD to audit a UI, you just need Nielsen's 10 Heuristics.\n\nFrom 'Visibility of System Status' to 'Error Prevention' — these principles are timeless because human psychology doesn't update every year."
  },
  {
    id: 'fb_3',
    title: 'The discipline of content strategy',
    author: 'Kristina Halvorson',
    source: 'A List Apart',
    type: 'Article',
    category: 'Strategy',
    url: 'https://alistapart.com/article/thedisciplineofcontentstrategy/',
    date: 'December 16, 2008',
    summary: [
      "Content strategy plans for the creation, publication, and governance of useful, usable content.",
      "It distinguishes between the 'editorial' strategy and the 'technical' strategy.",
      "Content must be treated as a business asset."
    ],
    insights: [
      "Content is not just copy; it's data, images, and video too.",
      "Governance is often the missing link in strategy; who owns it after launch?",
      "Silos between design and content teams hurt the end user experience.",
      "Content strategy defines how content supports business goals.",
      "Real content reveals design flaws that Lorem Ipsum hides."
    ],
    application_tips: [
      "Create a content audit spreadsheet before starting visual design.",
      "Define who owns what content update frequency after launch.",
      "Include real content in your wireframes, strictly ban Lorem Ipsum.",
      "Establish a 'voice and tone' guide alongside your UI style guide.",
      "Map content types to user needs, not just business wants."
    ],
    tweet_draft: "Lorem Ipsum is the enemy of good design.\n\nWithout a content strategy, you're just decorating rectangles. Treat content as a business asset, not a post-launch afterthought."
  },
  {
    id: 'fb_4',
    title: 'Design Systems 101',
    author: 'NNGroup',
    source: 'NNGroup',
    type: 'Article',
    category: 'Design Systems',
    url: 'https://www.nngroup.com/articles/design-systems-101/',
    date: 'April 11, 2021',
    summary: [
      "A design system is a set of standards to manage design at scale by reducing redundancy.",
      "It includes a pattern library and a style guide.",
      "The goal is to aid in digital product design and development."
    ],
    insights: [
      "Single source of truth is essential for scaling teams.",
      "Documentation is as important as the code components themselves.",
      "Adoption is the hardest part of a design system, not the creation.",
      "Design systems bridge the gap between design and engineering.",
      "They evolve; a static system is a dead system."
    ],
    application_tips: [
      "Start small with a UI kit before building a full documentation site.",
      "Interview developers to see what they actually need from the system.",
      "Don't over-engineer components early on; wait for reuse cases.",
      "Nominate 'system ambassadors' in different product squads.",
      "Measure success by speed of shipping, not just consistency."
    ],
    tweet_draft: "A design system without adoption is just a component library.\n\nThe real work isn't in the Figma file—it's in the governance, the documentation, and the relationships with engineering."
  }
];