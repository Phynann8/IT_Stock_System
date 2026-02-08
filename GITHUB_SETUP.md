# GitHub Repository Setup Guide

## Status

Repository is already connected to GitHub:

`https://github.com/Phynann8/IT_Stock_System.git`

## Quick Verify

```powershell
git remote -v
git branch --show-current
git status
```

## Push Latest Changes

```powershell
git add .
git commit -m "Update project"
git push
```

## Notes

- If push requires authentication over HTTPS, use a GitHub Personal Access Token (PAT).
- If you prefer SSH, set the remote URL with `git remote set-url origin git@github.com:Phynann8/IT_Stock_System.git`.
