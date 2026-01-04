
# Daily Design Digest (AI-Powered)

An intelligent, editorial-style daily briefing for Product Designers. It uses Google's Gemini AI to curate articles, summarize content, and generate insights.

---

## 🚀 How to Host This App (Beginner's Guide)

Follow these steps to put this application on the web using **GitHub Pages**. You do not need to be a coding expert!

### Step 1: Get Your Free AI Key
This app needs a "brain" to work. We use Google's Gemini API.
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Click **Create API Key**.
3. Copy the key string (it starts with `AIza...`).
4. **Save this key** somewhere safe. You will need it in Step 3.

### Step 2: Put This Code on GitHub
1. Create a new repository on GitHub (name it something like `design-digest`).
2. Upload all the files from this project to that repository.

### Step 3: Add Your API Key to GitHub
To keep your key safe, we don't put it in the code. We give it to GitHub secretly.
1. In your GitHub repository, go to the **Settings** tab (top right).
2. On the left sidebar, scroll down to **Secrets and variables** and click **Actions**.
3. Click the green button **New repository secret**.
4. **Name**: `API_KEY` (Must be exactly this, all caps).
5. **Secret**: Paste the key you copied in Step 1.
6. Click **Add secret**.

### Step 4: Set Up Automatic Deployment
We will create a helper script that builds the website automatically.
1. In your repository, click the **Add file** button -> **Create new file**.
2. Name the file exactly: `.github/workflows/deploy.yml`
   *(Note: that is a dot at the start, then github, then workflows folder)*.
3. Paste the following code into that file:

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
3. Under **Build and deployment** > **Source**, change the dropdown to **GitHub Actions** (it might default to "Deploy from a branch", change it to "GitHub Actions").
4. GitHub will now automatically start building your website.

### Step 6: View Your Site!
1. Click on the **Actions** tab at the top of your repo.
2. You should see a workflow titled "Deploy to GitHub Pages" running (yellow circle) or completed (green checkmark).
3. Once it's green, click on it, then click "deploy" to find your website URL, or go back to **Settings > Pages** to see your live link!

---

## 💻 Running Locally (Optional)
If you want to run this on your own computer:

1. Install [Node.js](https://nodejs.org/).
2. Open a terminal in the project folder.
3. Create a file named `.env` and add your key: `API_KEY=your_key_here`
4. Run `npm install`
5. Run `npm run dev`
