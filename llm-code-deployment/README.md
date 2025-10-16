# LLM Code Deployment

An automated system that receives task requests, generates code using Large Language Models (LLMs), deploys applications to GitHub Pages, and handles evaluation notifications.

## 🎯 Features

- **Automated Code Generation**: Uses LLMs (OpenAI GPT-4, Claude, or AIPipe) to generate complete web applications
- **GitHub Integration**: Automatically creates repositories and deploys to GitHub Pages
- **Signature Verification**: Secure request validation using cryptographic signatures
- **Retry Logic**: Robust error handling with exponential backoff
- **Round-based Updates**: Supports initial deployment (Round 1) and updates (Round 2)
- **Comprehensive Logging**: Detailed logs for debugging and monitoring

## 📋 Prerequisites

- Node.js 16.0.0 or higher
- npm 8.0.0 or higher
- Git installed on your system
- GitHub account
- At least one LLM API key (OpenAI, Anthropic, or AIPipe)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd llm-code-deployment
npm install
```

### 2. Configuration

Run the setup wizard:

```bash
npm run setup
```

Or manually create a `.env` file with:

```env
# Student Information
STUDENT_EMAIL=your-email@example.com
USERCODE=your-unique-code

# GitHub Configuration
GITHUB_TOKEN=your_github_token
GITHUB_USERNAME=your-github-username

# LLM API (choose one or more)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
AIPIPE_TOKEN=your_aipipe_token

# Server Configuration
PORT=3000
API_ENDPOINT_PATH=/api/task
```

### 3. Get API Keys

**GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Select scopes: `repo`, `workflow`, `admin:repo_hook`
4. Copy the token

**OpenAI (Optional):**
- Get from https://platform.openai.com/api-keys

**Anthropic Claude (Optional):**
- Get from https://console.anthropic.com/

**AIPipe (Free Option):**
- Sign up at https://aipipe.io/

### 4. Start the Server

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## 🧪 Testing

Test your endpoint:

```bash
npm test
```

Or manually with curl:

```bash
curl http://localhost:3000/api/task \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@example.com",
    "task": "test-task-123",
    "round": 1,
    "nonce": "abc123",
    "brief": "Create a simple hello world page",
    "checks": ["Page displays hello world"],
    "evaluation_url": "https://httpbin.org/post",
    "attachments": [],
    "signature": "test-signature"
  }'
```

## 📁 Project Structure

```
llm-code-deployment/
├── src/
│   ├── api/
│   │   ├── server.js          # Express server
│   │   └── taskHandler.js     # Task processing logic
│   ├── generator/
│   │   ├── llmClient.js       # LLM API integration
│   │   └── codeGenerator.js   # Code generation logic
│   ├── github/
│   │   └── githubManager.js   # GitHub automation
│   └── utils/
│       ├── logger.js          # Logging utility
│       ├── verifySignature.js # Signature verification
│       └── retryRequest.js    # HTTP retry logic
├── test/
│   └── testEndpoint.js        # Testing script
├── logs/                      # Application logs
├── generated-repos/           # Local repo storage
├── .env                       # Environment variables
├── index.js                   # Main entry point
└── setup.js                   # Setup wizard

```

## 🔧 API Endpoints

### POST /api/task

Receives task requests and processes them.

**Request:**
```json
{
  "email": "student@example.com",
  "task": "captcha-solver-abc",
  "round": 1,
  "nonce": "unique-nonce",
  "brief": "Create a captcha solver...",
  "checks": ["Check 1", "Check 2"],
  "evaluation_url": "https://example.com/evaluate",
  "attachments": [],
  "signature": "cryptographic-signature"
}
```

**Response:**
```json
{
  "usercode": "your-unique-code",
  "message": "Task accepted and processing",
  "status": "accepted"
}
```

### GET /health

Health check endpoint.

### GET /status/:task/:round

Check the status of a processed task.

## 🔐 Security

- **Signature Verification**: All requests must include a valid cryptographic signature
- **No Secrets in Repos**: Automatically prevents committing secrets to generated repositories
- **Token Security**: GitHub tokens are never committed (protected by .gitignore)

## 📊 Logging

Logs are stored in the `logs/` directory with timestamps:
- Application logs: `logs/app-YYYY-MM-DD.log`
- Includes request details, errors, and processing status

## 🔄 How It Works

### Round 1 (Initial Deployment)

1. Receive task request via POST
2. Verify signature
3. Return usercode immediately
4. Generate code using LLM (background process)
5. Create GitHub repository
6. Push code to repository
7. Enable GitHub Pages
8. Notify evaluation server

### Round 2 (Updates)

1. Receive update request
2. Verify signature
3. Return usercode immediately
4. Generate updated code using LLM
5. Update existing repository
6. Push changes (auto-redeploys Pages)
7. Notify evaluation server

## 🐛 Troubleshooting

### Server won't start

- Check `.env` file has all required variables
- Ensure port 3000 is not already in use
- Verify Node.js version: `node --version` (should be ≥16.0.0)

### GitHub deployment fails

- Verify GitHub token has correct permissions
- Check GitHub username is correct
- Ensure repository name doesn't already exist

### Code generation fails

- Verify LLM API key is valid and has credits
- Check API key permissions
- Review logs in `logs/` directory

### Signature verification fails

- Ensure `public_key.pem` file is present (provided by instructor)
- In development, signature verification may be skipped

## 📝 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `STUDENT_EMAIL` | Yes | Your email address |
| `USERCODE` | Yes | Your unique identifier |
| `GITHUB_TOKEN` | Yes | GitHub personal access token |
| `GITHUB_USERNAME` | Yes | Your GitHub username |
| `OPENAI_API_KEY` | No* | OpenAI API key |
| `ANTHROPIC_API_KEY` | No* | Anthropic API key |
| `AIPIPE_TOKEN` | No* | AIPipe token |
| `PORT` | No | Server port (default: 3000) |
| `LOG_LEVEL` | No | Logging level (default: info) |

*At least one LLM API key is required

## 🤝 Contributing

This is an educational project. Follow best practices:
- Keep secrets in `.env` (never commit)
- Test thoroughly before submission
- Document any custom modifications

## 📄 License

MIT License - See LICENSE file for details

## 🆘 Support

- Check logs in `logs/` directory for detailed error information
- Refer to project documentation
- Contact course instructors for project-specific questions

---

**Note**: This project is part of an automated evaluation system. Ensure your API endpoint is accessible and responds correctly to receive full credit.