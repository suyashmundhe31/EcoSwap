// Test script for the new GET /mint-coin endpoint
// Run this with: node test_mint_coin_get.js

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testMintCoinGet() {
  console.log('🧪 Testing GET /mint-coin endpoint...\n');

  try {
    // Test 1: Get all minted coins
    console.log('1️⃣ Testing: Get all minted coins');
    const response1 = await fetch(`${API_BASE_URL}/solar-panel/mint-coin`);
    const data1 = await response1.json();
    console.log('✅ Response:', JSON.stringify(data1, null, 2));
    console.log('');

    // Test 2: Get with pagination
    console.log('2️⃣ Testing: Get with pagination (skip=0, limit=5)');
    const response2 = await fetch(`${API_BASE_URL}/solar-panel/mint-coin?skip=0&limit=5`);
    const data2 = await response2.json();
    console.log('✅ Response:', JSON.stringify(data2, null, 2));
    console.log('');

    // Test 3: Filter by name
    console.log('3️⃣ Testing: Filter by name (solar)');
    const response3 = await fetch(`${API_BASE_URL}/solar-panel/mint-coin?name=solar`);
    const data3 = await response3.json();
    console.log('✅ Response:', JSON.stringify(data3, null, 2));
    console.log('');

    // Test 4: Filter by source
    console.log('4️⃣ Testing: Filter by source (solar_plant)');
    const response4 = await fetch(`${API_BASE_URL}/solar-panel/mint-coin?source=solar_plant`);
    const data4 = await response4.json();
    console.log('✅ Response:', JSON.stringify(data4, null, 2));
    console.log('');

    // Test 5: Combined filters
    console.log('5️⃣ Testing: Combined filters (name=solar, source=solar_plant, limit=3)');
    const response5 = await fetch(`${API_BASE_URL}/solar-panel/mint-coin?name=solar&source=solar_plant&limit=3`);
    const data5 = await response5.json();
    console.log('✅ Response:', JSON.stringify(data5, null, 2));

  } catch (error) {
    console.error('❌ Error testing GET endpoint:', error.message);
  }
}

// Test POST endpoint for comparison
async function testMintCoinPost() {
  console.log('\n🪙 Testing POST /mint-coin endpoint for comparison...\n');

  try {
    const formData = new FormData();
    formData.append('name', 'Test Solar Project');
    formData.append('credits', '10.5');
    formData.append('source', 'solar_plant');
    formData.append('description', 'Test minting via POST');

    const response = await fetch(`${API_BASE_URL}/solar-panel/mint-coin`, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    console.log('✅ POST Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error testing POST endpoint:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🚀 Starting mint-coin endpoint tests...\n');
  
  // First test POST to create some data
  await testMintCoinPost();
  
  // Then test GET to retrieve the data
  await testMintCoinGet();
  
  console.log('\n✨ Tests completed!');
}

// Check if running in Node.js environment
if (typeof fetch === 'undefined') {
  console.log('⚠️  This script requires Node.js 18+ with built-in fetch support');
  console.log('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

runTests();
