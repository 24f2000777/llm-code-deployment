# Quick Reference Guide

## 🚀 Common Commands

### Starting the Server
```bash
npm start              # Start production server
npm run dev            # Start with auto-reload (development)
```

### Testing
```bash
npm test               # Run automated tests
curl http://localhost:3000/health  # Check server health
```

### Setup
```bash
node setup.js          # Run setup wizard
npm install            # Install dependencies
```

### Logs
```bash
# View logs (Linux/macOS)
tail -f logs/app-*.log

# View logs (Windows)
type logs\app-*.log

# Clear old logs
rm logs/*.log          # Linux/macOS
del logs\*.log         # Windows
```

## 📝 File Locations

| File | Purpose |
|------|---------|
| `.env` | Configuration and secrets |
| `logs/app-*.log` | Application logs |
| `generated-repos/` | Temporary repo storage |
| `public_key.pem` | Public key for signature verification |

## 🔗 API Endpoints

### Health Check
```bash
GET http://localhost:3000/health
```

### Task Endpoint
```bash
POST http://localhost:3000/api/task
Content-Type: application/json

{
  "email": "student@example.com",
  "task": "task-name",
  "round": 1,
  "nonce": "unique-nonce",
  "brief": "Task description",
  "checks": ["Check 1", "Check 2"],
  "evaluation_url": "https://example.com/evaluate",
  "attachments": [],
  "signature": "signature-string"
}
```

### Status Check
```bash
GET http://localhost:3000/status/task-name/1
```

## 🔑 Environment Variables

### Required
```env
STUDENT_EMAIL=your-email@example.com
USERCODE=your-unique-code
GITHUB_TOKEN=ghp_your_token
GITHUB_USERNAME=your-username
```

### LLM Provider (at least one)
```env
OPENAI_API_KEY=sk-your_key
ANTHROPIC_API_KEY=your_key
AIPIPE_TOKEN=your_token
```

### Optional
```env
PORT=3000
LOG_LEVEL=info
NODE_ENV=development
```

## 🐛 Quick Troubleshooting

### Server won't start
```bash
# Check port availability
lsof -ti:3000          # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Reinstall dependencies
rm -rf node_modules
npm install
```

### GitHub errors
```bash
# Test GitHub connection
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user

# Verify token has correct permissions:
# repo, workflow, admin:repo_hook
```

### LLM errors
```bash
# Check API key format
# OpenAI: starts with sk-
# Anthropic: check console.anthropic.com
# AIPipe: check aipipe.io dashboard
```

## 📊 Monitoring

### Check server status
```bash
curl http://localhost:3000/health | json_pp
```

### Watch logs in real-time
```bash
# macOS/Linux
tail -f logs/app-$(date +%Y-%m-%d).log

# Windows PowerShell
Get-Content logs\app-*.log -Wait -Tail 10
```

### Check task status
```bash
curl http://localhost:3000/status/task-name/1 | json_pp
```

## 🔒 Security Checklist

- [ ] `.env` file is in `.gitignore`
- [ ] Never commit GitHub tokens
- [ ] Never commit LLM API keys
- [ ] Public key file (`public_key.pem`) present
- [ ] Signature verification enabled in production

## 🚢 Deployment Quick Guide

### Local Testing
```bash
npm start
# Access at http://localhost:3000
```

### Deploy to Cloud
```bash
# Option 1: Heroku
heroku create
git push heroku main

# Option 2: Railway
# Push to GitHub, connect in Railway dashboard

# Option 3: Render
# Connect GitHub repo in Render dashboard
```

### Required for Cloud Deployment
- Set all environment variables from `.env`
- Start command: `npm start`
- Build command: `npm install`
- Node.js version: 16.x or higher

## 📞 Support Resources

- Main README: `README.md`
- Installation Guide: `INSTALLATION.md`
- Project Documentation: Course materials
- Logs Directory: `logs/`

## ⚡ Pro Tips

1. **Use nodemon for development:**
   ```bash
   npm run dev
   ```

2. **Monitor logs continuously:**
   ```bash
   tail -f logs/app-*.log | grep ERROR
   ```

3. **Test signature verification:**
   - Development: Verification skipped if no public key
   - Production: Must have valid `public_key.pem`

4. **Clean up old repos:**
   ```bash
   rm -rf generated-repos/*
   ```

5. **Restart server quickly:**
   ```bash
   pkill -f "node index.js" && npm start
   ```

6. **Check disk space:**
   ```bash
   du -sh generated-repos/ logs/
   ```

## 🎯 Testing Workflow

1. Start server: `npm start`
2. Wait for "Server is running" message
3. Test health: `curl http://localhost:3000/health`
4. Run test: `npm test`
5. Check logs: `cat logs/app-*.log`
6. Verify GitHub repo created (if test passed)

## 📋 Pre-Submission Checklist

Before submitting your endpoint URL:

- [ ] Server starts without errors
- [ ] Health endpoint returns 200 OK
- [ ] Test request returns usercode
- [ ] Logs show successful processing
- [ ] Test repo created on GitHub
- [ ] GitHub Pages is enabled and accessible
- [ ] All environment variables set correctly
- [ ] No secrets committed to git

---

**Quick Help:** Run `node setup.js` anytime to reconfigure settings.