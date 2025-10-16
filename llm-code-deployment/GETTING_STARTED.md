# Getting Started - Complete Beginner's Guide

Welcome! This guide will help you set up and run your LLM Code Deployment system, even if you're completely new to this.

## 🎯 What This System Does

This system:
1. ✅ Receives task requests (someone tells it to build an app)
2. ✅ Uses AI (LLM) to write the code automatically
3. ✅ Creates a GitHub repository
4. ✅ Deploys the app to GitHub Pages (makes it live on the web)
5. ✅ Notifies the evaluation server when done
6. ✅ Can update the app if asked (Round 2)

## 🚦 Step-by-Step Setup (Absolute Beginner)

### Step 1: Install Software (15 minutes)

**1.1 Install Node.js**
- Go to: https://nodejs.org/
- Click the big green button on the left (LTS version)
- Download and install
- Keep clicking "Next" until it's done

**1.2 Install Git**
- Go to: https://git-scm.com/downloads
- Download for your operating system
- Install with default settings

**1.3 Verify Installation**
Open Terminal (Mac/Linux) or Command Prompt (Windows):
```bash
node --version
npm --version
git --version
```
You should see version numbers. If you do, you're good!

### Step 2: Get Your API Keys (20 minutes)

**2.1 GitHub Token (Required)**
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token" → "Generate new token (classic)"
3. Name it: "LLM Deployment"
4. Check these boxes:
   - ✅ All boxes under "repo"
   - ✅ workflow
   - ✅ admin:repo_hook
5. Click green "Generate token" button at bottom
6. **COPY THE TOKEN** (you won't see it again!)
7. Paste it in a text file and save it somewhere safe

**2.2 LLM API Key (Required - Pick ONE)**

**OPTION A: AIPipe (FREE - Recommended for beginners)**
1. Go to: https://aipipe.io/
2. Sign up (free)
3. Go to dashboard
4. Copy your API token
5. Save it

**OPTION B: OpenAI (Paid, but very good)**
1. Go to: https://platform.openai.com/signup
2. Create account
3. Add payment method (costs ~$0.01-0.10 per task)
4. Go to: https://platform.openai.com/api-keys
5. Create key, copy it, save it

**OPTION C: Anthropic Claude (Paid)**
1. Go to: https://console.anthropic.com/
2. Sign up and add payment
3. Get API key from dashboard

### Step 3: Create Your Project (10 minutes)

**3.1 Create Folder**
```bash
# Open terminal/command prompt and type:
mkdir llm-code-deployment
cd llm-code-deployment
```

**3.2 Initialize Project**
```bash
npm init -y
```

**3.3 Install Required Packages**
```bash
npm install express body-parser dotenv axios simple-git @octokit/rest fs-extra
npm install --save-dev nodemon
```

This will take a few minutes. You'll see lots of text scrolling - that's normal!

**3.4 Create Folders**

**On Windows:**
```bash
mkdir src
mkdir src\api
mkdir src\generator
mkdir src\github
mkdir src\utils
mkdir test
mkdir logs
mkdir generated-repos
mkdir scripts
```

**On Mac/Linux:**
```bash
mkdir -p src/api src/generator src/github src/utils test logs generated-repos scripts
```

### Step 4: Add the Code Files (20 minutes)

Now you need to create each file with the code I provided above. Here's the checklist:

**Root directory files:**
- [ ] `.gitignore` - Copy from artifact above
- [ ] `.env` - Create empty, will fill in step 5
- [ ] `package.json` - Update with artifact above
- [ ] `index.js` - Copy from artifact above
- [ ] `setup.js` - Copy from artifact above
- [ ] `README.md` - Copy from artifact above
- [ ] `INSTALLATION.md` - Copy from artifact above
- [ ] `QUICKREF.md` - Copy from artifact above

**src/utils/ files:**
- [ ] `src/utils/logger.js`
- [ ] `src/utils/verifySignature.js`
- [ ] `src/utils/retryRequest.js`

**src/generator/ files:**
- [ ] `src/generator/llmClient.js`
- [ ] `src/generator/codeGenerator.js`

**src/github/ files:**
- [ ] `src/github/githubManager.js`

**src/api/ files:**
- [ ] `src/api/taskHandler.js`
- [ ] `src/api/server.js`

**test/ files:**
- [ ] `test/testEndpoint.js`

**How to create files:**
1. Open each file in a text editor (Notepad, VS Code, etc.)
2. Copy the code from the artifacts I provided
3. Paste into the file
4. Save the file

### Step 5: Configure Your Settings (5 minutes)

**5.1 Run Setup Wizard**
```bash
node setup.js
```

**5.2 Enter Your Information:**
- Email: your-email@example.com
- Usercode: Make up a unique code like "student-12345"
- GitHub username: your GitHub username
- GitHub token: Paste the token from Step 2.1
- Choose LLM (1, 2, or 3): Pick the one you got a key for
- Paste your LLM API key
- Port: Just press Enter (uses default 3000)

**5.3 Manual Setup (if wizard doesn't work):**

Create a file called `.env` with this content:
```env
STUDENT_EMAIL=your-email@example.com
USERCODE=student-12345
GITHUB_TOKEN=paste-your-github-token-here
GITHUB_USERNAME=your-github-username
AIPIPE_TOKEN=paste-your-aipipe-token-here
PORT=3000
API_ENDPOINT_PATH=/api/task
LOG_LEVEL=info
NODE_ENV=development
```

### Step 6: Start Your Server! (2 minutes)

```bash
npm start
```

You should see:
```
🚀 Server is running!
Port: 3000
API Endpoint: http://localhost:3000/api/task
```

**🎉 Congratulations! Your server is running!**

### Step 7: Test It (5 minutes)

**7.1 Test Server Health**

Open browser and go to:
```
http://localhost:3000/health
```

You should see JSON with "status": "healthy"

**7.2 Run Automated Test**

Open a NEW terminal (keep the server running) and type:
```bash
npm test
```

This will:
- Send a test task
- Generate code with AI
- Create a GitHub repository
- Deploy to GitHub Pages
- Show you the results

**7.3 Check Your GitHub**

Go to your GitHub profile (https://github.com/YOUR_USERNAME)
You should see a new repository called something like "test-hello-world"

**7.4 Check the Live Website**

The test will show you a URL like:
```
https://YOUR_USERNAME.github.io/test-hello-world/
```

Visit that URL - you should see your AI-generated webpage!

## ✅ Success Checklist

- [ ] Node.js installed
- [ ] Git installed  
- [ ] GitHub token obtained
- [ ] LLM API key obtained
- [ ] All files created
- [ ] `.env` configured
- [ ] Server starts successfully
- [ ] Test passes
- [ ] Repository created on GitHub
- [ ] Website is live on GitHub Pages

## 🎓 What to Do Next

### For Your Assignment

1. **Keep your server running** - Use `npm start`
2. **Submit your endpoint URL** to instructors
   - If running locally: `http://YOUR_IP:3000/api/task`
   - If deployed: Your cloud URL
3. **Wait for real tasks** - Instructors will send requests
4. **Monitor logs** - Check `logs/` folder for activity

### Making Your Server Accessible

Your server is currently only on your computer. To receive tasks from instructors, you need to:

**Option 1: Deploy to Cloud (Recommended)**
- Use Railway, Render, or Heroku (see QUICKREF.md)
- They provide a public URL automatically

**Option 2: Use ngrok (For Testing)**
```bash
# Install ngrok from ngrok.com
ngrok http 3000
# Copy the https URL it gives you
```

**Option 3: Use Your Computer's IP (Local Network Only)**
- Only works if instructors are on same network
- Find your IP: `ipconfig` (Windows) or `ifconfig` (Mac/Linux)
- Use: `http://YOUR_IP:3000/api/task`

## 🆘 Common Problems & Solutions

### "Command not found"
**Problem:** System doesn't recognize `node`, `npm`, or `git`
**Solution:** Restart your terminal/command prompt after installing software

### "Port 3000 already in use"
**Problem:** Something else is using port 3000
**Solution:** Change PORT in `.env` to 3001 or 3002

### "Cannot find module"
**Problem:** Missing dependencies
**Solution:** 
```bash
rm -rf node_modules
npm install
```

### "GitHub authentication failed"
**Problem:** Wrong token or expired
**Solution:** Generate a new GitHub token (Step 2.1)

### "OpenAI/Claude API error"
**Problem:** No credits or wrong key
**Solution:** Use AIPipe instead (it's free!)

### Server starts but test fails
**Problem:** Could be many things
**Solution:** Check logs:
```bash
cat logs/app-*.log
```
Look for "ERROR" messages

## 📚 Learning Resources

- **What is an API?** https://www.youtube.com/watch?v=s7wmiS2mSXY
- **Git & GitHub basics:** https://www.youtube.com/watch?v=RGOj5yH7evk
- **Node.js basics:** https://nodejs.dev/learn

## 💡 Pro Tips

1. **Always check logs** when something goes wrong
2. **Test locally first** before deploying
3. **Keep your .env file secure** - never share it
4. **Use `npm run dev`** during development (auto-restarts on changes)
5. **Read error messages carefully** - they usually tell you what's wrong

## 🎉 You're All Set!

Your LLM Code Deployment system is ready to:
- Receive tasks
- Generate code with AI
- Deploy to GitHub Pages
- Handle updates

Good luck with your project! 🚀

---

**Need help?** Check the logs in `logs/` directory or refer to README.md for detailed documentation.