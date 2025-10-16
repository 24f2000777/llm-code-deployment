const axios = require('axios');
require('dotenv').config();

/**
 * Verify your submission is ready for Google Form
 * This checks all requirements from the specification
 */
async function verifySubmission() {
  console.log('='.repeat(80));
  console.log('🔍 SUBMISSION VERIFICATION');
  console.log('='.repeat(80));

  let allPassed = true;

  // Step 1: Check Environment Variables
  console.log('\n1️⃣  Checking Environment Variables...\n');
  
  const email = process.env.STUDENT_EMAIL;
  const secret = process.env.USER_SECRET;
  const githubToken = process.env.GITHUB_TOKEN;
  const githubUser = process.env.GITHUB_USERNAME;

  if (email && email !== 'your-email@example.com') {
    console.log(`   ✅ STUDENT_EMAIL: ${email}`);
  } else {
    console.log('   ❌ STUDENT_EMAIL not configured!\n');
    allPassed = false;
  }

  if (secret && secret !== 'your-secret-key-here') {
    console.log(`   ✅ USER_SECRET: ${secret.substring(0, 16)}...`);
  } else {
    console.log('   ❌ USER_SECRET not configured!\n');
    allPassed = false;
  }

  if (githubToken && githubToken.startsWith('ghp_')) {
    console.log(`   ✅ GITHUB_TOKEN: ghp_...${githubToken.slice(-8)}`);
  } else {
    console.log('   ❌ GITHUB_TOKEN not configured!\n');
    allPassed = false;
  }

  if (githubUser) {
    console.log(`   ✅ GITHUB_USERNAME: ${githubUser}\n`);
  } else {
    console.log('   ❌ GITHUB_USERNAME not configured!\n');
    allPassed = false;
  }

  // Step 2: Check Server is Running
  console.log('2️⃣  Checking Server...\n');
  
  const port = process.env.PORT || 3000;
  const baseUrl = `http://localhost:${port}`;
  
  try {
    const healthResponse = await axios.get(`${baseUrl}/health`, { timeout: 5000 });
    
    if (healthResponse.status === 200) {
      console.log(`   ✅ Server is running on port ${port}`);
      console.log(`   ✅ Health check passed\n`);
    } else {
      console.log(`   ⚠️  Server responded with status ${healthResponse.status}\n`);
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ Server is not running!');
    console.log('      Start it with: npm start\n');
    allPassed = false;
    return;
  }

  // Step 3: Test API Endpoint
  console.log('3️⃣  Testing API Endpoint...\n');
  
  const endpoint = process.env.API_ENDPOINT_PATH || '/api/task';
  const testRequest = {
    email: email,
    secret: secret,
    task: 'verification-test-' + Date.now(),
    round: 1,
    nonce: 'verify-' + Math.random().toString(36).substring(7),
    brief: 'Test brief for verification',
    checks: ['Test check'],
    evaluation_url: 'https://httpbin.org/post',
    attachments: []
  };

  try {
    const response = await axios.post(`${baseUrl}${endpoint}`, testRequest, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });

    if (response.status === 200) {
      console.log('   ✅ HTTP 200 OK received (SPEC COMPLIANT)');
      
      if (response.data && response.data.status) {
        console.log(`   ✅ Response has status: ${response.data.status}`);
      }
      
      console.log('   ✅ API endpoint working correctly!\n');
    } else {
      console.log(`   ⚠️  Expected HTTP 200, got ${response.status}\n`);
      allPassed = false;
    }
  } catch (error) {
    console.log('   ❌ API test failed!');
    if (error.response) {
      console.log(`      Status: ${error.response.status}`);
      console.log(`      Error: ${JSON.stringify(error.response.data)}`);
    } else {
      console.log(`      Error: ${error.message}`);
    }
    console.log();
    allPassed = false;
  }

  // Step 4: Check GitHub Repo (if provided)
  console.log('4️⃣  Checking GitHub Repository...\n');
  
  const repoUrl = process.env.GITHUB_REPO_URL;
  if (repoUrl && repoUrl.includes('github.com')) {
    console.log(`   ✅ Repo URL: ${repoUrl}`);
    
    // Verify it matches username
    if (repoUrl.includes(githubUser)) {
      console.log(`   ✅ Matches GitHub username\n`);
    } else {
      console.log(`   ⚠️  Repo URL doesn't match GitHub username\n`);
    }
  } else {
    console.log('   ℹ️  GITHUB_REPO_URL not set in .env');
    console.log('      This is the repo containing your API code');
    console.log('      Example: https://github.com/24f2000777/llm-code-deployer\n');
  }

  // Final Summary
  console.log('='.repeat(80));
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED - READY FOR SUBMISSION!');
    console.log('='.repeat(80));
    console.log('\n📋 GOOGLE FORM SUBMISSION:\n');
    console.log('1. What is the URL of your API?');
    console.log(`   → https://your-deployed-app.com${endpoint}`);
    console.log('');
    console.log('2. What "secret" value should we send your API?');
    console.log(`   → ${secret}`);
    console.log('');
    console.log('3. What is the GitHub home page URL of your repo?');
    console.log(`   → ${repoUrl || 'https://github.com/' + githubUser + '/llm-code-deployer'}`);
    console.log('\n' + '='.repeat(80));
  } else {
    console.log('❌ SOME CHECKS FAILED - FIX ISSUES BEFORE SUBMISSION');
    console.log('='.repeat(80));
  }
}

// Run verification
console.log('Starting submission verification...\n');
verifySubmission().catch(error => {
  console.error('Verification failed:', error.message);
  process.exit(1);
});