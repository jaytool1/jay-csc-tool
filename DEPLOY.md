# GitHub Pages Deployment Guide for Jay CSC Tool

This guide explains how to host your **Jay CSC Tool** website on GitHub Pages.

## Step 1: Push your code to GitHub
1. Create a new repository on GitHub (e.g., `jay-csc-tool`).
2. Open your terminal in the project folder.
3. Initialize git and push:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/jay-csc-tool.git
   git push -u origin main
   ```

## Step 2: Automatic Deployment (Recommended)
The easiest way is to use **GitHub Actions**. 

1. Create a file at `.github/workflows/deploy.yml` with the following content:
   ```yaml
   name: Deploy to GitHub Pages

   on:
     push:
       branches: [main]

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Set up Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: 'npm'

         - name: Install dependencies
           run: npm install

         - name: Build
           run: npm run build

         - name: Setup Pages
           uses: actions/configure-pages@v4

         - name: Upload artifact
           uses: actions/upload-pages-artifact@v3
           with:
             path: './dist'

         - name: Deploy to GitHub Pages
           id: deployment
           uses: actions/deploy-pages@v4
   ```

2. Go to your repository on GitHub -> **Settings** -> **Pages**.
3. Under **Build and deployment** -> **Source**, select **GitHub Actions**.

## Step 3: Enjoy your live site!
Once the GitHub Action finishes, your site will be live at:
`https://YOUR_USERNAME.github.io/jay-csc-tool/`

---
### Why GitHub?
- **Free Hosting**: Always free for public repositories.
- **Fast CDN**: Global edge locations for fast loading.
- **Auto-Update**: Every time you push code, your website updates automatically.
