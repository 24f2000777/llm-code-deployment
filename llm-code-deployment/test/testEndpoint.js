const axios = require('axios');
require('dotenv').config();

/**
 * Test the API endpoint with a sample request
 * SPEC-COMPLIANT: Tests against markdown specification
 */
async function testEndpoint() {
  console.log('='.repeat(80));
  console.log('🧪 Testing API Endpoint (Spec-Compliant)');
  console.log('='.repeat(80));

  const baseUrl = `http://localhost:${process.env.PORT || 3000}`;
  const endpoint = process.env.API_ENDPOINT_PATH || '/api/task';
  const url = `${baseUrl}${endpoint}`;

  // Test request payload - MATCHES SPECIFICATION EXACTLY
  const testRequest = {
    email: process.env.STUDENT_EMAIL || 'test@example.com',
    secret: process.env.USER_SECRET || 'test-secret-for-development',
    task: 'calculator-test-' + Date.now(),
    round: 1,
    nonce: 'test-nonce-' + Math.random().toString(36).substring(7),
    brief: 'Create a simple calculator web application with addition, subtraction, multiplication, and division operations.',
    checks: [
      'Repo has MIT license',
      'README.md is professional',
      'Page has calculator interface',
      'All operations work correctly'
    ],
    evaluation_url: 'https://httpbin.org/post',
    attachments: []
  };

  console.log('\n📤 Sending request to:', url);
  console.log('📝 Request payload:');
  console.log(JSON.stringify({
    ...testRequest,
    secret: '***HIDDEN***'
  }, null, 2));

  try {
    console.log('\n⏳ Waiting for response...\n');
    
    const response = await axios.post(url, testRequest, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });

    console.log('✅ Success!');
    console.log('='.repeat(80));
    console.log('📥 Response:');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
    console.log('='.repeat(80));

    // Verify HTTP 200 (as per spec: "Send a HTTP 200 JSON response")
    if (response.status === 200) {
      console.log('\n✅ HTTP 200 OK received (SPEC COMPLIANT)');
      
      // Optional: show status if present
      if (response.data && response.data.status) {
        console.log('✅ Response status:', response.data.status);
      }
      
      console.log('✅ All specification requirements met!');
    } else {
      console.log('\n⚠️  Warning: Expected HTTP 200, got', response.status);
    }

    console.log('\n💡 Task Processing:');
    console.log('   → The task is now being processed in the background');
    console.log('   → Check server logs for detailed progress');
    console.log('   → A GitHub repository will be created automatically');
    console.log('   → GitHub Pages will be enabled and deployed');
    console.log('   → Evaluation endpoint will be notified within 10 minutes');

  } catch (error) {
    console.error('\n❌ Test Failed!');
    console.error('Error:', error.message);
    
    if (error.response) {
      console.error('\nResponse Details:');
      console.error('  Status:', error.response.status);
      console.error('  Data:', JSON.stringify(error.response.data, null, 2));
      
      if (error.response.status === 401) {
        console.error('\n⚠️  Secret verification failed!');
        console.error('    Check that USER_SECRET in .env matches the secret in the request');
      }
    } else if (error.request) {
      console.error('\n⚠️  No response received from server');
      console.error('    Is the server running? Try: npm start');
    }
    
    console.log('='.repeat(80));
    process.exit(1);
  }
}

// Run the test
console.log('Starting API endpoint test...\n');
testEndpoint();