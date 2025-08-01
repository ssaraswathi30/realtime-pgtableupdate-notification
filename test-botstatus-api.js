// Test script for bot status API endpoints
const http = require('http');

const API_BASE = 'http://localhost:8080';

// Test data
const testBotStatuses = [
  {
    bot_name: 'TestBot-Alpha',
    status: 'ONLINE',
    health_score: 95,
    description: 'Primary test bot running optimally'
  },
  {
    bot_name: 'TestBot-Beta',
    status: 'MAINTENANCE',
    health_score: 30,
    description: 'Undergoing scheduled maintenance'
  },
  {
    bot_name: 'TestBot-Gamma',
    status: 'ERROR',
    health_score: 15,
    description: 'Experiencing connection issues'
  }
];

function makeRequest(options, data = null) {
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
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testBotStatusAPI() {
  console.log('🤖 Testing Bot Status API Endpoints...\n');

  try {
    // Test 1: Health check
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/health',
      method: 'GET'
    });
    console.log('Health check:', healthResponse.data);
    console.log('Status:', healthResponse.status === 200 ? '✅ PASS' : '❌ FAIL');
    console.log();

    // Test 2: Insert bot statuses
    console.log('2. Inserting test bot statuses...');
    for (const botStatus of testBotStatuses) {
      const response = await makeRequest({
        hostname: 'localhost',
        port: 8080,
        path: '/api/botstatus',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }, botStatus);
      
      console.log(`   Inserted ${botStatus.bot_name}:`, response.status === 200 ? '✅ PASS' : '❌ FAIL');
      if (response.status !== 200) {
        console.log('   Error:', response.data);
      }
    }
    console.log();

    // Test 3: Get all bot statuses
    console.log('3. Retrieving all bot statuses...');
    const getResponse = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/botstatus',
      method: 'GET'
    });
    
    console.log('Get bot statuses:', getResponse.status === 200 ? '✅ PASS' : '❌ FAIL');
    if (getResponse.status === 200 && getResponse.data.success) {
      console.log(`   Found ${getResponse.data.botstatuses.length} bot statuses`);
      getResponse.data.botstatuses.forEach(bot => {
        console.log(`   - ${bot.bot_name}: ${bot.status} (${bot.health_score}%)`);
      });
    } else {
      console.log('   Error:', getResponse.data);
    }
    console.log();

    console.log('🎉 Bot Status API test completed!');
    console.log('💡 Open http://localhost:3000/dashboard.html to see the real-time updates');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('💡 Make sure the server is running with: docker-compose up -d');
  }
}

// Run the test
testBotStatusAPI();
