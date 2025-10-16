const logger = require('../utils/logger');
const llmClient = require('./llmClient');

/**
 * Main code generator module
 * Generates complete web applications using LLMs
 */

/**
 * Generate application code
 * @param {Object} request - Task request
 * @returns {Promise<Object>} - Generated files
 */
async function generateApplication(request) {
  const { task, brief, checks, attachments } = request;
  
  logger.info('Starting code generation', { task, brief: brief.substring(0, 100) });

  try {
    // Generate the prompt
    const prompt = createPrompt(brief, checks, attachments);
    
    // Call LLM to generate code
    const response = await llmClient.generateCode(prompt);
    
    // Parse and validate the response
    const html = parseHTML(response);
    
    // Generate complete file set
    const files = {
      'index.html': html,
      'LICENSE': generateLicense(),
      'README.md': generateReadme(task, brief)
    };
    
    logger.info('Application generated successfully', { 
      task,
      filesGenerated: Object.keys(files),
      htmlLength: html.length
    });
    
    return files;
    
  } catch (error) {
    logger.error('Code generation failed', { 
      error: error.message,
      task 
    });
    
    // Return fallback application
    logger.warn('Using fallback application', { task });
    return generateFallback(task, brief, checks);
  }
}

/**
 * Create LLM prompt
 */
function createPrompt(brief, checks, attachments) {
  let prompt = `Create a complete, single-page HTML web application.

CRITICAL REQUIREMENTS:
- Output ONLY valid HTML code
- Start with <!DOCTYPE html>
- Include all CSS in <style> tags in <head>
- Include all JavaScript in <script> tags before </body>
- Make it fully functional and modern
- DO NOT use markdown code blocks
- Close ALL HTML tags properly

TASK:
${brief}

REQUIREMENTS:
${checks.map((c, i) => `${i + 1}. ${c}`).join('\n')}
`;

  if (attachments && attachments.length > 0) {
    prompt += `\n\nATTACHMENTS:\n`;
    attachments.forEach(att => {
      prompt += `- ${att.name}\n`;
    });
  }

  prompt += `\n\nGenerate the complete HTML now:`;
  
  return prompt;
}

/**
 * Parse HTML from LLM response
 */
function parseHTML(response) {
  let html = response;
  
  // Remove markdown code blocks if present
  if (html.includes('```html')) {
    const match = html.match(/```html\s*([\s\S]*?)\s*```/);
    if (match) html = match[1];
  } else if (html.includes('```')) {
    const match = html.match(/```\s*([\s\S]*?)\s*```/);
    if (match) html = match[1];
  }
  
  html = html.trim();
  
  // Basic validation
  if (!html.includes('<!DOCTYPE') && !html.includes('<html')) {
    throw new Error('Invalid HTML structure');
  }
  
  // Auto-fix missing closing tag
  if (!html.endsWith('</html>') && html.includes('</body>')) {
    html += '\n</html>';
  }
  
  return html;
}

/**
 * Generate MIT License
 */
function generateLicense() {
  const year = new Date().getFullYear();
  return `MIT License

Copyright (c) ${year}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;
}

/**
 * Generate README
 */
function generateReadme(task, brief) {
  return `# ${task}

## Description

${brief}

## Features

This application was automatically generated to meet the specified requirements.

## Usage

Open the deployed GitHub Pages site to use the application.

## License

MIT License - see LICENSE file for details.

---

*Generated automatically by LLM Code Deployment System*`;
}

/**
 * Generate fallback application
 */
function generateFallback(task, brief, checks) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${task}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 { color: #333; margin-bottom: 20px; }
        .brief {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 30px;
            border-left: 4px solid #667eea;
        }
        .brief h2 { color: #667eea; margin-bottom: 10px; }
        .brief p { color: #666; line-height: 1.6; }
        .requirement {
            background: #f8f9fa;
            padding: 15px 20px;
            margin-bottom: 10px;
            border-radius: 8px;
            display: flex;
            align-items: center;
        }
        .requirement::before {
            content: '✓';
            color: #667eea;
            font-weight: bold;
            font-size: 1.5em;
            margin-right: 15px;
        }
        .status {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 10px;
            padding: 20px;
            margin-top: 20px;
        }
        .status h3 { color: #856404; margin-bottom: 10px; }
        .status p { color: #856404; }
    </style>
</head>
<body>
    <div class="container">
        <h1>${task}</h1>
        <div class="brief">
            <h2>Task Brief</h2>
            <p>${brief}</p>
        </div>
        <div class="requirements">
            <h2>Requirements</h2>
            ${checks.map(check => `<div class="requirement">${check}</div>`).join('\n            ')}
        </div>
        <div class="status">
            <h3>⚠️ Fallback Mode</h3>
            <p>This is a placeholder. The AI generation will be retried.</p>
        </div>
    </div>
</body>
</html>`;

  return {
    'index.html': html,
    'LICENSE': generateLicense(),
    'README.md': generateReadme(task, brief)
  };
}

module.exports = {
  generateApplication
};