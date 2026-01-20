# GitHub Repository Setup Guide

## Step 1: Create the Repository on GitHub

1. Go to: https://github.com/new
2. Repository name: `the_adom_project`
3. Description: "Co-Executive Intelligence System - Atomic Engine"
4. Choose **Public** or **Private** (your preference)
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click **Create repository**

## Step 2: Authentication Setup

GitHub requires authentication. You have two options:

### Option A: Personal Access Token (Recommended for HTTPS)

1. Go to: https://github.com/settings/tokens
2. Click **Generate new token** → **Generate new token (classic)**
3. Give it a name: "The Adom Project"
4. Select scopes: Check **repo** (full control of private repositories)
5. Click **Generate token**
6. **Copy the token immediately** (you won't see it again!)

Then use it when pushing:
```bash
git push --set-upstream origin main
# Username: DarnedMoon85
# Password: [paste your token here]
```

### Option B: SSH Key (More Secure, One-Time Setup)

1. Check if you have an SSH key:
   ```bash
   ls ~/.ssh/id_*.pub
   ```

2. If no key exists, generate one:
   ```bash
   ssh-keygen -t ed25519 -C "darnedmoon85@gmail.com"
   # Press Enter to accept default location
   # Optionally set a passphrase
   ```

3. Copy your public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```

4. Add to GitHub:
   - Go to: https://github.com/settings/keys
   - Click **New SSH key**
   - Title: "The Adom Project"
   - Paste your public key
   - Click **Add SSH key**

5. Update remote URL to use SSH:
   ```bash
   git remote set-url origin git@github.com:DarnedMoon85/the_adom_project.git
   ```

## Step 3: Push Your Code

After setting up authentication:

```bash
git push --set-upstream origin main
```

## Troubleshooting

- **"Repository not found"**: Make sure you created the repository on GitHub first
- **"Authentication failed"**: Use a Personal Access Token instead of password
- **"Permission denied"**: Check that your SSH key is added to GitHub (for SSH method)
