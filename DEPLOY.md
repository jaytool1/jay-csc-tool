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

> [!IMPORTANT]
> **CRITICAL SETUP**: Go to your repository on GitHub -> **Settings** -> **Pages**.
> Under **Build and deployment** -> **Source**, you **MUST** select **GitHub Actions** (instead of "Deploy from a branch"). If you don't change this, the deployment will fail with a "Missing environment" error.

## Step 3: Enjoy your live site!
Once the GitHub Action finishes, your site will be live at:
`https://YOUR_USERNAME.github.io/jay-csc-tool/`

---
### Why GitHub?
- **Free Hosting**: Always free for public repositories.
- **Fast CDN**: Global edge locations for fast loading.
- **Auto-Update**: Every time you push code, your website updates automatically.
