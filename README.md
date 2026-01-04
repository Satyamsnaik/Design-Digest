# Daily Design Digest (AI-Powered)

An intelligent, editorial-style daily briefing for Product Designers. It uses Google's Gemini AI to curate articles, summarize content, and generate insights.

---

## 🚀 Beginner's Guide: How to Put This App on the Web

You can host this app for free using **GitHub Pages**. Follow these steps exactly, and you'll have your own live website in minutes!

### Step 1: Get Your Free AI Key
This app needs a "brain" to work. We use Google's Gemini API.
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Copy the key string (it starts with `AIza...`).
4. **Save this key** somewhere safe. You will need it in Step 3.

### Step 2: Create a GitHub Repository
1. Log in to your [GitHub account](https://github.com/).
2. Click the **+** icon in the top right and select **New repository**.
3. Name it something like `design-digest`.
4. Make sure it is set to **Public**.
5. Click **Create repository**.
6. Upload all the files from this project to that repository (you can drag and drop them or use the "Upload files" button).

### Step 3: Add Your API Key to GitHub
To keep your key safe, we don't put it in the code. We give it to GitHub secretly.
1. inside your new repository on GitHub, click the **Settings** tab (top right).
2. On the left sidebar, scroll down to **Secrets and variables** and click **Actions**.
3. Click the green button **New repository secret**.
4. **Name**: `API_KEY` (Must be exactly this, all caps).
5. **Secret**: Paste the key you copied in Step 1.
6. Click **Add secret**.

### Step 4: Set Up Automatic Deployment
We will create a special file that tells GitHub how to build your website.
1. In your repository, click **Add file** -> **Create new file**.
2. Name the file exactly: `.github/workflows/deploy.yml`
   *(Type it exactly like that: dot, github, slash, workflows, slash, deploy.yml)*.
3. Paste the code below into the file:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Set up Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
      - name: Install dependencies
        run: npm install
      - name: Build
        run: npm run build
        env:
          # This pulls the key from the secret you made in Step 3
          API_KEY: ${{ secrets.API_KEY }}
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```
4. Click **Commit changes** (green button).

### Step 5: Turn on GitHub Pages
1. Go back to your repository **Settings**.
2. On the left sidebar, click **Pages**.
3. Under **Build and deployment** > **Source**, change the dropdown to **GitHub Actions**.
   *(If you don't see this option, ensure you created the file in Step 4 correctly).*
4. GitHub will now automatically start building your website.

### Step 6: View Your Site!
1. Click on the **Actions** tab at the top of your repository.
2. You should see a workflow titled "Deploy to GitHub Pages" running (yellow circle) or completed (green checkmark).
3. Once it's green, click on it, then click "deploy" to find your website URL.
4. Click the link to open your App!

---

## ❓ Troubleshooting

**"npm error code ETARGET"**
If you see an error about `@google/genai` version `0.1.0` not found:
This means the version in `package.json` is outdated. Ensure your `package.json` file has `@google/genai` version set to `^0.2.0` or higher.

**"Briefing generation failed"**
If the app loads but doesn't generate digests:
1. Check that you added the `API_KEY` secret correctly in Step 3.
2. Ensure the key name is exactly `API_KEY` (all caps).
3. Try generating a new key in Google AI Studio.

---

## 💻 Running Locally (Optional)
If you want to run this on your own computer:

1. Install [Node.js](https://nodejs.org/).
2. Open a terminal in the project folder.
3. Create a file named `.env` in the root folder and add your key: `API_KEY=your_key_here`
4. Run `npm install`
5. Run `npm run dev`
