
# Daily Design Digest (AI-Powered)

A curated, AI-driven daily briefing tool for Product Designers, Strategists, and UI Engineers. This application uses the Google Gemini API to scan the web for high-quality design articles, case studies, and mental models, summarizing them into an editorial-style digest.

## Features

- **Personalized Content**: Choose from topics like Product Thinking, Design Systems, AI in UX, and more.
- **Experience Levels**: Tailor content for Junior, Mid-Level, or Senior designers.
- **URL Deep Dive**: Paste any article or video URL to get an instant breakdown of insights and actionable tips.
- **Save & History**: Bookmarking system and local history storage.
- **No-Build Architecture**: Runs directly in the browser using React, Tailwind CSS (CDN), and Babel Standalone.

## Prerequisites

You need a **Google Gemini API Key** to use this application.
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Create a generic API key (paid or free tier).
3. You will enter this key when the app loads.

> **Note:** The API key is stored securely in your browser's `localStorage` and is never sent to any server other than Google's official API endpoints.

---

## 🚀 How to Host on GitHub Pages

Because this project requires no build step (no `npm build`), hosting it is incredibly fast.

### Step 1: Create a GitHub Repository
1. Log in to GitHub.
2. Click the **+** icon in the top right and select **New repository**.
3. Name it `Design-Digest` (or whatever you prefer).
4. Make sure it is **Public** (unless you have GitHub Pro).
5. Click **Create repository**.

### Step 2: Upload Your Files
1. On your computer, make sure all project files (`index.html`, `index.tsx`, `App.tsx`, `types.ts`, etc.) are in a folder.
2. Open your terminal/command prompt in that folder.
3. Run the following commands (replace `YOUR_USERNAME` and `REPO_NAME` with yours):

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git
git push -u origin main
```

*(Alternatively, you can use the "Upload files" button on the GitHub website to drag and drop all files directly into the repo).*

### Step 3: Enable GitHub Pages
1. Go to your repository page on GitHub.
2. Click on the **Settings** tab (top horizontal menu).
3. On the left sidebar, click **Pages** (under the "Code and automation" section).
4. Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5. Under **Branch**, select `main` (or `master`) and ensure the folder is `/(root)`.
6. Click **Save**.

### Step 4: Access Your App
1. Wait about 1-2 minutes. GitHub is deploying your site.
2. Refresh the Pages settings page. You will see a bar at the top saying:
   > "Your site is live at https://your-username.github.io/repo-name/"
3. Click that link to open your app!

---

## 💻 How to Run Locally

Since this app uses ES Modules, you cannot simply double-click `index.html` to open it. You need a local HTTP server.

### Option A: VS Code "Live Server" (Recommended)
1. Open the project folder in **VS Code**.
2. Install the **Live Server** extension (by Ritwick Dey).
3. Right-click on `index.html` and select **Open with Live Server**.

### Option B: Python
If you have Python installed, open your terminal in the project folder and run:
```bash
# Python 3
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option C: Node.js (http-server)
```bash
npx http-server .
```

---

## Technical Details

- **Framework**: React 19 (via ESM imports)
- **Styling**: Tailwind CSS (via CDN Script)
- **Compilation**: Babel Standalone (In-browser TSX compilation)
- **AI Model**: Google Gemini 1.5 Pro / Gemini 3 (via `@google/genai` SDK)
- **Icons**: Lucide React

## FAQ / Troubleshooting

**Q: I see a console warning: "You are using the in-browser Babel transformer..."**
A: This is normal for this specific "No-Build" project setup. It means the browser is compiling your code on the fly, which is perfect for demos and GitHub Pages hosting but slower than a pre-compiled app. You can safely ignore this warning.

**Q: The screen is white/blank.**
A: Ensure you are serving the file via a local server (http://localhost...) and not opening it directly as a file (file://...). Browsers block module imports from the file system for security.
