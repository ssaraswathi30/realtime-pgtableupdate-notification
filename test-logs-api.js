// Test script for logs API endpoint
const http = require('http');

const API_BASE = 'http://localhost:8080';

function makeRequest(options) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve({ status: res.statusCode, data: result });
        } catch (error) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.end();
  });
}

async function testLogsAPI() {
  console.log('📊 Testing Logs API Endpoint...\n');

  try {
    // Test 1: Get logs with default limit
    console.log('1. Testing logs endpoint (default limit)...');
    const defaultResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/logs',
      method: 'GET'
    });
    
    console.log('Status:', defaultResponse.status === 200 ? '✅ PASS' : '❌ FAIL');
    if (defaultResponse.status === 200 && defaultResponse.data.success) {
      console.log(`   Found ${defaultResponse.data.logs.length} logs`);
      console.log('   Latest logs:');
      defaultResponse.data.logs.slice(0, 3).forEach(log => {
        console.log(`   - #${log.id} [${log.log_level}] ${log.message}`);
      });
    } else {
      console.log('   Error:', defaultResponse.data);
    }
    console.log();

    // Test 2: Get logs with custom limit
    console.log('2. Testing logs endpoint with limit=5...');
    const limitResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/logs?limit=5',
      method: 'GET'
    });
    
    console.log('Status:', limitResponse.status === 200 ? '✅ PASS' : '❌ FAIL');
    if (limitResponse.status === 200 && limitResponse.data.success) {
      console.log(`   Requested 5 logs, got ${limitResponse.data.logs.length} logs`);
      console.log('   Logs are sorted by created_at DESC:', 
        limitResponse.data.logs.length > 1 ? 
        (new Date(limitResponse.data.logs[0].created_at) >= new Date(limitResponse.data.logs[1].created_at) ? '✅ YES' : '❌ NO') : 
        '✅ N/A (single log)');
    }
    console.log();

    console.log('🎉 Logs API test completed!');
    console.log('💡 Now when you refresh http://localhost:3000/dashboard.html, you\'ll see existing logs AND bot statuses!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the server is running with: docker-compose up -d');
  }
}

// Run the test
testLogsAPI();
