
# Daily Design Digest (AI-Powered)

A curated, AI-driven daily briefing tool for Product Designers, Strategists, and UI Engineers.

## 🛠️ Installation & Hosting (The Reliable Way)

Because this app uses multiple TypeScript files, it must be **built** before it can run in a browser. Browsers cannot read `.tsx` files directly.

### Prerequisites
You need **Node.js** installed on your computer. [Download it here](https://nodejs.org/).

### 1. Local Setup
1. Open your terminal in this project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. **CRITICAL STEP**: Run the development server:
   ```bash
   npm run dev
   ```
4. Look at the terminal output. It will show a local URL (usually `http://localhost:5173`).
5. **Open that localhost URL in your browser.**

### 2. How to Deploy to GitHub Pages

To make it live on the internet, you need to create a `dist` folder and upload that.

1. **Build the project**:
   ```bash
   npm run build
   ```
   This creates a `dist` folder with optimized HTML, CSS, and JS.

2. **Deploy**:
   
   **Option A: Manual Upload**
   - Go to your GitHub Repository.
   - Upload the **contents** of the `dist` folder (index.html, assets folder, etc.) to the root of your repository (or a `gh-pages` branch).
   - Enable GitHub Pages in Settings > Pages.

   **Option B: Using Git (Recommended)**
   - Remove the `dist` folder from `.gitignore` if it's there.
   - Run these commands:
     ```bash
     npm run build
     git add dist -f
     git commit -m "Deploy build"
     git subtree push --prefix dist origin gh-pages
     ```
   - Go to GitHub Settings > Pages and select the `gh-pages` branch.

## ⚠️ Troubleshooting Errors

**Error: "Failed to load module script... MIME type of 'application/octet-stream'"**
- **Cause:** You are trying to run the app by double-clicking `index.html` or using a simple file server (like Python `http.server` or VS Code Live Server defaults). Browsers cannot read the `.tsx` code directly.
- **Solution:** You MUST run `npm run dev` in your terminal and open the `localhost:5173` link provided. This command starts Vite, which translates the code for the browser automatically.

**Error: "Tailwind CSS is not defined"**
- **Solution:** Ensure you ran `npm install` to download Tailwind, and start the app with `npm run dev`.

## Features

- **Personalized Content**: Choose from topics like Product Thinking, Design Systems, AI in UX, and more.
- **Experience Levels**: Tailor content for Junior, Mid-Level, or Senior designers.
- **URL Deep Dive**: Paste any article or video URL to get an instant breakdown.
- **Save & History**: Bookmarking system and local history storage.

## Tech Stack
- **Vite**: Build tool for bundling.
- **React 19**: UI Framework.
- **Tailwind CSS**: Styling.
- **Google GenAI SDK**: AI Intelligence.
