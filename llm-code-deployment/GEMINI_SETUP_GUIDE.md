# Google Gemini Setup Guide

This guide is specifically for setting up the project with **Google Gemini API only**.

## 🌟 Why Gemini?

- ✅ **FREE tier available** - 60 requests per minute for free!
- ✅ **No credit card required** for free tier
- ✅ **Good quality** code generation
- ✅ **Easy to get started**

## 🔑 Step 1: Get Your Gemini API Key (5 minutes)

### 1.1 Go to Google AI Studio
Open your browser and go to:
```
https://makersuite.google.com/app/apikey
```

Or visit: https://aistudio.google.com/

### 1.2 Sign in with Google Account
- Use your Gmail account
- Accept the terms of service

### 1.3 Create API Key
1. Click on **"Create API Key"** button
2. Choose **"Create API key in new project"** (or select existing project)
3. Your API key will be generated immediately
4. Click **"Copy"** to copy the key
5. **Save it somewhere safe!** (e.g., in a text file)

Your key will look like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

### 1.4 Note the Free Tier Limits
- 60 requests per minute
- 1,500 requests per day
- More than enough for this project!

## 🚀 Step 2: Complete Project Setup

### 2.1 Install Node.js
If you haven't already:
- Go to https://nodejs.org/
- Download and install LTS version
- Restart your terminal

### 2.2 Create Project Directory
```bash
mkdir llm-code-deployment
cd llm-code-deployment
```

### 2.3 Initialize Project
```bash
npm init -y
```

### 2.4 Install ALL Required Packages
```bash
npm install express body-parser dotenv axios simple-git @octokit/rest @google/generative-ai fs-extra
npm install --save-dev nodemon
```

**Important:** Make sure `@google/generative-ai` is installed!

### 2.5 Create Project Structure
**Windows:**
```bash
mkdir src src\api src\generator src\github src\utils test logs generated-repos scripts
```

**Mac/Linux:**
```bash
mkdir -p src/api src/generator src/github src/utils test logs generated-repos scripts
```

## 📁 Step 3: Add Code Files

Copy all the code files from the artifacts provided above. You need:

**Root files:**
- `index.js`
- `setup.js`
- `package.json`
- `.gitignore`
- `README.md`

**src/utils/**
- `logger.js`
- `verifySignature.js`
- `retryRequest.js`

**src/generator/**
- `llmClient.js` ← **Updated with Gemini support!**
- `codeGenerator.js`

**src/github/**
- `githubManager.js`

**src/api/**
- `taskHandler.js`
- `server.js`

**test/**
- `testEndpoint.js`

## ⚙️ Step 4: Configure with Gemini

### 4.1 Run Setup Wizard
```bash
node setup.js
```

When asked which LLM to use, choose **1** (Google Gemini)

### 4.2 Enter Your Details:
```
Student Email: your-email@example.com
Usercode: student-12345 (make up any unique code)
GitHub username: your-github-username
GitHub token: ghp_your_github_token_here
Choose LLM: 1
Gemini API key: AIzaSy... (paste your key)
Port: (press Enter for 3000)
```

### 4.3 Your .env File Should Look Like:
```env
# Student Information
STUDENT_EMAIL=your-email@example.com
USERCODE=student-12345

# GitHub Configuration
GITHUB_TOKEN=ghp_your_github_token_here
GITHUB_USERNAME=your-github-username

# LLM API Configuration
GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Server Configuration
PORT=3000
API_ENDPOINT_PATH=/api/task
LOG_LEVEL=info
NODE_ENV=development
PUBLIC_KEY_PATH=./public_key.pem
```

**Don't forget to get your GitHub token from:** https://github.com/settings/tokens

## 🎯 Step 5: Test Everything

### 5.1 Start the Server
```bash
npm start
```

You should see:
```
📋 Configuration:
   Student Email: your-email@example.com
   GitHub User: your-github-username
   User Code: student-12345
   Port: 3000
   LLM Provider: Google Gemini

🚀 Server is running!
```

### 5.2 Test Health Check
Open browser and go to:
```
http://localhost:3000/health
```

Should show: `{"status":"healthy",...}`

### 5.3 Run Full Test
Open a NEW terminal (keep server running) and run:
```bash
npm test
```

This will:
1. Send a test task ✅
2. Generate code with Gemini ✅
3. Create GitHub repository ✅
4. Deploy to GitHub Pages ✅
5. Show you the live URL ✅

### 5.4 Check Your GitHub
Go to: `https://github.com/YOUR_USERNAME`

You should see a new repository like `test-hello-world`

### 5.5 Check the Live Site
Visit the URL shown in the test output:
```
https://YOUR_USERNAME.github.io/test-hello-world/
```

You should see your AI-generated webpage!

## ✅ Verification Checklist

- [ ] Gemini API key obtained
- [ ] GitHub token obtained
- [ ] All packages installed (including `@google/generative-ai`)
- [ ] All code files created
- [ ] `.env` file configured with Gemini key
- [ ] Server starts successfully
- [ ] Logs show "LLM Provider: Google Gemini"
- [ ] Test passes
- [ ] Repository created on GitHub
- [ ] Website live on GitHub Pages

## 🐛 Troubleshooting

### "Cannot find module '@google/generative-ai'"
**Solution:**
```bash
npm install @google/generative-ai
```

### "Gemini API authentication failed"
**Solution:**
- Check your API key is correct (starts with `AIzaSy`)
- Make sure there are no extra spaces
- Generate a new key from: https://makersuite.google.com/app/apikey

### "Rate limit exceeded"
**Solution:**
- Free tier: 60 requests/minute
- Wait a minute and try again
- You're probably testing too frequently

### "Invalid API key"
**Solution:**
1. Go back to https://makersuite.google.com/app/apikey
2. Delete old key
3. Create new key
4. Update `.env` file with new key
5. Restart server

## 💡 Gemini-Specific Tips

1. **Free Tier is Generous**
   - 60 requests per minute
   - 1,500 per day
   - Perfect for this project!

2. **Response Quality**
   - Gemini generates good quality code
   - Sometimes adds markdown code blocks (code handles this)
   - Works great for web development tasks

3. **No Credit Card Needed**
   - Unlike OpenAI and Claude
   - Start using immediately
   - Upgrade later if needed

4. **Monitor Usage**
   - Check usage at: https://aistudio.google.com/
   - View in API keys section
   - See request counts

## 📊 Expected Output

When server starts with Gemini:
```
📋 Configuration:
   Student Email: your@email.com
   GitHub User: yourusername
   User Code: student-12345
   Port: 3000
   LLM Provider: Google Gemini    ← Should say this!

=================================
🚀 Server is running!
=================================
```

When processing a task:
```
[2024-10-15T10:30:00.000Z] [INFO] Generating code with Google Gemini
[2024-10-15T10:30:02.500Z] [INFO] Code generated successfully with Gemini
```

## 🎉 Success!

Once everything works:
1. Keep your server running (`npm start`)
2. Your API endpoint is ready to receive tasks
3. Monitor logs in `logs/` directory
4. Gemini will automatically generate code for each task

## 🌐 Making Your Server Accessible

For instructors to send tasks, you need a public URL:

**Option 1: ngrok (Easiest for testing)**
```bash
# Install ngrok from ngrok.com
npx ngrok http 3000

# Copy the https://xxxx.ngrok.io URL
# Submit this URL to instructors
```

**Option 2: Deploy to Cloud**
- Railway.app (easiest)
- Render.com (has free tier)
- Heroku (requires credit card)

See `QUICKREF.md` for deployment instructions.

## 📝 Quick Reference

**Start server:**
```bash
npm start
```

**Test endpoint:**
```bash
npm test
```

**View logs:**
```bash
# Linux/Mac
tail -f logs/app-*.log

# Windows
type logs\app-*.log
```

**Check Gemini usage:**
Visit: https://aistudio.google.com/

---

**🎊 You're all set with Gemini!** Your system is ready to generate and deploy applications automatically.