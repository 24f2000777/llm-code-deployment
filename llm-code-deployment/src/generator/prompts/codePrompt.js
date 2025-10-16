/**
 * Generate prompt for LLM code generation
 * IMPROVED: More explicit instructions for valid HTML
 */
function generateCodePrompt(brief, checks, attachments) {
  let prompt = `You are an expert web developer. Create a COMPLETE, VALID, SINGLE-PAGE HTML application.

CRITICAL REQUIREMENTS:
1. Generate a SINGLE, COMPLETE HTML file with ALL code embedded
2. HTML must be VALID and WELL-FORMED with ALL tags properly closed
3. Include <!DOCTYPE html>, <html>, <head>, and <body> tags
4. ALL CSS must be in <style> tags in the <head>
5. ALL JavaScript must be in <script> tags before </body>
6. Do NOT use external libraries unless absolutely necessary
7. Do NOT use markdown code blocks - output ONLY the raw HTML
8. Make it functional, modern, and responsive

TASK:
${brief}

EVALUATION CRITERIA:
${checks.map((check, i) => `${i + 1}. ${check}`).join('\n')}
`;

  // Add attachment information
  if (attachments && attachments.length > 0) {
    prompt += `\n\nATTACHMENTS PROVIDED:\n`;
    attachments.forEach(att => {
      prompt += `- ${att.name}: Use this data in your application\n`;
      // If it's a CSV, show structure
      if (att.name.endsWith('.csv') && att.url.includes('base64,')) {
        const data = Buffer.from(att.url.split('base64,')[1], 'base64').toString('utf-8');
        const lines = data.split('\n').slice(0, 3);
        prompt += `  Preview:\n  ${lines.join('\n  ')}\n`;
      }
    });
  }

  prompt += `\n\nIMPORTANT:
- Output ONLY the complete HTML code
- Start with <!DOCTYPE html>
- End with </html>
- NO explanations, NO markdown, NO code blocks
- Make sure ALL tags are properly closed
- Test mentally that the HTML is valid before outputting

Generate the complete HTML now:`;

  return prompt;
}

/**
 * Generate README prompt
 */
function generateReadmePrompt(taskName, brief, repoUrl, pagesUrl) {
  return `Create a professional README.md for this GitHub repository.

Repository: ${repoUrl}
Live Site: ${pagesUrl}
Project: ${taskName}

Task Description:
${brief}

Include these sections:
1. # ${taskName} - Clear title
2. Brief description of what the app does
3. ## Live Demo - Link to ${pagesUrl}
4. ## Features - List key features
5. ## Technologies - HTML, CSS, JavaScript
6. ## Usage - How to use the application
7. ## Development - How to run locally
8. ## License - MIT License

Make it professional, clear, and concise. Use proper markdown formatting.

Generate the README.md content:`;
}

module.exports = {
  generateCodePrompt,
  generateReadmePrompt
};