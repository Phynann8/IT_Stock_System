# GitHub Repository Setup Guide

## ✅ Git Repository Initialized Successfully!

Your IT_Stock_System has been initialized as a git repository with an initial commit containing:
- index.html
- styles.css  
- script.js
- README.md
- .gitignore

## 📋 Next Steps: Create GitHub Repository

Since GitHub CLI is not installed, please follow these steps to create the repository on GitHub:

### Step 1: Create Repository on GitHub.com

1. Go to https://github.com/new (or click the "+" icon on GitHub → "New repository")

2. Fill in the repository details:
   - **Repository name**: `IT_Stock_System` (or your preferred name)
   - **Description**: "IT Asset & Inventory Management System with dark mode and color themes"
   - **Visibility**: Choose Public or Private
   - **❌ DO NOT** initialize with README, .gitignore, or license (we already have these)

3. Click **"Create repository"**

### Step 2: Push Your Code to GitHub

After creating the repository, GitHub will show you commands. Use these commands in PowerShell:

```powershell
# Navigate to your project directory (if not already there)
cd e:\Website_Development\IT_Stock_System

# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/IT_Stock_System.git

# Rename branch to main (recommended)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

### Alternative: Using SSH (if you have SSH keys set up)

```powershell
# Add remote using SSH
git remote add origin git@github.com:YOUR_USERNAME/IT_Stock_System.git

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔑 Authentication

When you run `git push`, you'll be prompted to authenticate:

- **HTTPS**: You'll need a Personal Access Token (PAT)
  - Go to GitHub Settings → Developer settings → Personal access tokens → Generate new token
  - Select "repo" scope
  - Copy the token and use it as your password

- **SSH**: Requires SSH key setup (GitHub Settings → SSH and GPG keys)

## ✨ After Pushing

Once pushed, your repository will be live at:
```
https://github.com/YOUR_USERNAME/IT_Stock_System
```

You can then:
- Share the repository with others
- Deploy to GitHub Pages, Vercel, or Netlify
- Collaborate with team members
- Track issues and pull requests

## 📊 Current Git Status

- **Branch**: master (will be renamed to main)
- **Commits**: 1 initial commit
- **Files tracked**: 5 files
- **Status**: ✅ Clean working tree (ready to push)

## 🚀 Quick Commands Reference

```powershell
# Check status
git status

# View commit history
git log --oneline

# Add more files
git add .
git commit -m "Your commit message"
git push

# Pull latest changes
git pull

# Create new branch
git checkout -b feature-name
```

---

**Note**: Since this project uses Firebase, make sure to keep your Firebase API keys secure. The current configuration is in the code, which is acceptable for a public demo, but for production, consider using environment variables.
