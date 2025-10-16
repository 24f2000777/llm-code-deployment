# Complete Installation Guide

This guide will walk you through setting up the LLM Code Deployment system from scratch.

## ✅ Prerequisites Checklist

Before starting, ensure you have:

- [ ] Computer with internet connection
- [ ] Basic command line knowledge
- [ ] Text editor (VS Code recommended)
- [ ] GitHub account
- [ ] Email address

## 📥 Step 1: Install Required Software

### 1.1 Install Node.js

**Windows:**
1. Go to https://nodejs.org/
2. Download the LTS version (left button)
3. Run the installer
4. Click "Next" through all prompts
5. Verify installation:
   ```bash
   node --version
   npm --version
   ```

**macOS:**
```bash
# Using Homebrew
brew install node

# Verify
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
npm --version
```

### 1.2 Install Git

**Windows:**
1. Go to https://git-scm.com/download/win
2. Download and run installer
3. Use default settings
4. Verify: `git --version`

**macOS:**
```bash
# Git usually comes pre-installed
git --version

# If not installed:
brew install git
```

**Linux:**
```bash
sudo apt-get install git
git --version
```

### 1.3 Install GitHub CLI (Optional but recommended)

**Windows:**
Download from: https://cli.github.com/

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

## 📦 Step 2: Project Setup

### 2.1 Create Project Directory

```bash
# Create and navigate to project directory
mkdir llm-code-deployment
cd llm-code-deployment
```

### 2.2 Initialize Node.js Project

```bash
npm init -y
```

### 2.3 Install Dependencies

```bash
npm install express body-parser dotenv axios simple-git @octokit/rest fs-extra
npm install --save-dev nodemon
```

### 2.4 Create Project Structure

**Windows (Command Prompt):**
```bash
mkdir src src\api src\generator src\github src\utils test logs generated-repos scripts
type nul > .env
type nul > .gitignore
type nul > README.md
type nul > index.js
type nul > setup.js
```

**macOS/Linux:**
```bash
mkdir -p src/api src/generator src/github src/utils test logs generated-repos scripts
touch .env .gitignore README.md index.js setup.js
```

## 🔑 Step 3: Get API Keys

### 3.1 GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Give it a name: "LLM Code Deployment"
4. Select scopes:
   - ✅ `repo` (all)
   - ✅ `workflow`
   - ✅ `admin:repo_hook`
5. Click "Generate token"
6. **IMPORTANT:** Copy the token immediately (you won't see it again!)
7. Save it in a safe place

### 3.2 Choose an LLM Provider

You need at least ONE of these:

**Option A: OpenAI (Paid)**
1. Go to https://platform.openai.com/signup
2. Create account and add payment method
3. Go to https://platform.openai.com/api-keys
4. Click "Create new secret key"
5. Copy and save the key

**Option B: Anthropic Claude (Paid)**
1. Go to https://console.anthropic.com/
2. Create account and add payment method
3. Go to API Keys section
4. Create new key
5. Copy and save the key

**Option C: AIPipe (Free - Recommended for testing)**
1. Go to https://aipipe.io/
2. Sign up for free account
3. Get your API token from dashboard
4. Copy and save the token

## ⚙️ Step 4: Configure the Project

### 4.1 Copy All Code Files

Copy the code from each artifact above into the respective files:

1. Copy `.gitignore` content
2. Copy all files in `src/utils/` directory
3. Copy all files in `src/generator/` directory
4. Copy all files in `src/github/` directory
5. Copy all files in `src/api/` directory
6. Copy `index.js`
7. Copy `setup.js`
8. Copy `test/testEndpoint.js`
9. Copy `package.json` (update existing file)
10. Copy `README.md`

### 4.2 Run Setup Wizard

```bash
node setup.js
```

Follow the prompts and enter:
- Your email
- Your usercode (can be any unique string like "student-12345")
- GitHub username
- GitHub token (from step 3.1)
- Choose LLM provider and enter key (from step 3.2)
- Port number (press Enter for default 3000)

### 4.3 Manual Configuration (Alternative)

If you prefer manual setup, create `.env` file:

```env
# Student Information
STUDENT_EMAIL=your-email@example.com
USERCODE=your-unique-code-123

# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_USERNAME=your-github-username

# LLM API (choose one)
OPENAI_API_KEY=sk-your_openai_key_here
# ANTHROPIC_API_KEY=your_claude_key_here
# AIPIPE_TOKEN=your_aipipe_token_here

# Server Configuration
PORT=3000
API_ENDPOINT_PATH=/api/task
LOG_LEVEL=info
NODE_ENV=development
PUBLIC_KEY_PATH=./public_key.pem
```

## 🚀 Step 5: Run the Application

### 5.1 Start the Server

```bash
npm start
```

You should see:
```
🚀 Server is running!
Port: 3000
API Endpoint: http://localhost:3000/api/task
```

### 5.2 Test the Server

Open a new terminal and run:

```bash
npm test
```

Or manually test:

```bash
curl http://localhost:3000/health
```

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-...",
  "uptime": 5.123
}
```

## 🔍 Step 6: Verify Installation

### 6.1 Check Server Health

Visit in browser: `http://localhost:3000/health`

### 6.2 Test API Endpoint

```bash
curl -X POST http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "task": "test-hello-world",
    "round": 1,
    "nonce": "test123",
    "brief": "Create a simple hello world page",
    "checks": ["Displays hello world"],
    "evaluation_url": "https://httpbin.org/post",
    "attachments": [],
    "signature": "test-sig"
  }'
```

Expected response:
```json
{
  "usercode": "your-unique-code-123",
  "message": "Task accepted and processing",
  "status": "accepted"
}
```

### 6.3 Check Logs

```bash
# Linux/macOS
cat logs/app-*.log

# Windows
type logs\app-*.log
```

## ✅ Success Checklist

- [ ] Node.js and npm installed
- [ ] Git installed
- [ ] Project created and dependencies installed
- [ ] GitHub token obtained
- [ ] LLM API key obtained
- [ ] .env file configured
- [ ] Server starts without errors
- [ ] Health check returns OK
- [ ] Test endpoint returns usercode
- [ ] Logs are being created

## 🐛 Troubleshooting

### Problem: "npm: command not found"
**Solution:** Node.js not installed correctly. Reinstall Node.js and restart terminal.

### Problem: "EADDRINUSE: address already in use"
**Solution:** Port 3000 is taken. Change PORT in .env to 3001 or kill the process using port 3000.

**Windows:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**macOS/Linux:**
```bash
lsof -ti:3000 | xargs kill -9
```

### Problem: "Missing required environment variables"
**Solution:** Check your .env file has all required fields. Run `node setup.js` again.

### Problem: "GitHub API authentication failed"
**Solution:** 
- Check GitHub token is correct
- Ensure token has required permissions (repo, workflow, admin:repo_hook)
- Token might be expired - generate a new one

### Problem: "OpenAI/Claude API error"
**Solution:**
- Verify API key is correct
- Check you have credits/billing enabled
- Try using AIPipe instead (free option)

### Problem: "Cannot find module..."
**Solution:** 
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📚 Next Steps

1. **Deploy to production:** See `scripts/deploy.sh` for deployment options
2. **Submit your endpoint:** Provide your deployed URL to instructors
3. **Monitor logs:** Check `logs/` directory regularly
4. **Test with real requests:** Wait for instructor's task requests

## 🆘 Getting Help

If you're still stuck:

1. Check the logs in `logs/` directory
2. Read the main README.md for detailed documentation
3. Review the troubleshooting section
4. Contact course instructors with:
   - Error message
   - Relevant log files
   - Steps you've already tried
   - Your operating system

## 🎉 Congratulations!

Your LLM Code Deployment system is now ready to receive and process tasks!

---

**Important:** Keep your `.env` file secure and never commit it to GitHub. The `.gitignore` file is already configured to prevent this.