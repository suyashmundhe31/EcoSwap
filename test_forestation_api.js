// Test script for the new Forestation API endpoints
// Run this with: node test_forestation_api.js

const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testForestationEndpoints() {
  console.log('🌲 Testing Forestation API endpoints...\n');

  try {
    // Test 1: Create forestation application (form data)
    console.log('1️⃣ Testing: Create forestation application');
    const formData1 = new FormData();
    formData1.append('full_name', 'John Forest Owner');
    formData1.append('aadhar_card', '1234 5678 9012');
    
    const response1 = await fetch(`${API_BASE_URL}/forestation/applications`, {
      method: 'POST',
      body: formData1
    });
    const data1 = await response1.json();
    console.log('✅ Application created:', JSON.stringify(data1, null, 2));
    console.log('');

    // Test 2: Save analysis results
    console.log('2️⃣ Testing: Save forestation analysis results');
    const formData2 = new FormData();
    formData2.append('application_id', '1');
    formData2.append('latitude', '13.0827');
    formData2.append('longitude', '77.5877');
    formData2.append('area_hectares', '5.0');
    formData2.append('co2_sequestration_rate', '2.5');
    formData2.append('annual_carbon_credits', '12.5');
    formData2.append('forest_type', 'tropical');
    formData2.append('tree_count', '150');
    formData2.append('vegetation_coverage', '85.5');

    const response2 = await fetch(`${API_BASE_URL}/forestation/analysis`, {
      method: 'POST',
      body: formData2
    });
    const data2 = await response2.json();
    console.log('✅ Analysis saved:', JSON.stringify(data2, null, 2));
    console.log('');

    // Test 3: Get analysis results
    console.log('3️⃣ Testing: Get forestation analysis results');
    const response3 = await fetch(`${API_BASE_URL}/forestation/analysis`);
    const data3 = await response3.json();
    console.log('✅ Analysis results:', JSON.stringify(data3, null, 2));
    console.log('');

    // Test 4: Mint forestation coins (POST)
    console.log('4️⃣ Testing: Mint forestation coins (POST)');
    const formData4 = new FormData();
    formData4.append('name', 'Tropical Forest Project');
    formData4.append('credits', '12.5');
    formData4.append('source', 'forestation');
    formData4.append('description', 'Carbon credits from tropical forest sequestration');

    const response4 = await fetch(`${API_BASE_URL}/forestation/mint-coin`, {
      method: 'POST',
      body: formData4
    });
    const data4 = await response4.json();
    console.log('✅ Coins minted:', JSON.stringify(data4, null, 2));
    console.log('');

    // Test 5: Get minted coins (GET)
    console.log('5️⃣ Testing: Get forestation minted coins (GET)');
    const response5 = await fetch(`${API_BASE_URL}/forestation/mint-coin`);
    const data5 = await response5.json();
    console.log('✅ Minted coins:', JSON.stringify(data5, null, 2));
    console.log('');

    // Test 6: Get minted coins with filters
    console.log('6️⃣ Testing: Get forestation minted coins with filters');
    const response6 = await fetch(`${API_BASE_URL}/forestation/mint-coin?name=tropical&source=forestation&limit=5`);
    const data6 = await response6.json();
    console.log('✅ Filtered coins:', JSON.stringify(data6, null, 2));
    console.log('');

    // Test 7: Get analysis results with filters
    console.log('7️⃣ Testing: Get analysis results with filters');
    const response7 = await fetch(`${API_BASE_URL}/forestation/analysis?application_id=1&limit=3`);
    const data7 = await response7.json();
    console.log('✅ Filtered analysis:', JSON.stringify(data7, null, 2));

  } catch (error) {
    console.error('❌ Error testing forestation endpoints:', error.message);
  }
}

// Test individual endpoints
async function testIndividualEndpoints() {
  console.log('\n🔍 Testing individual forestation endpoints...\n');

  const endpoints = [
    {
      name: 'Forestation Info',
      url: `${API_BASE_URL}/forestation/`,
      method: 'GET'
    },
    {
      name: 'Health Check',
      url: `${API_BASE_URL}/forestation/health`,
      method: 'GET'
    },
    {
      name: 'Calculate Carbon Credits',
      url: `${API_BASE_URL}/forestation/calculate-carbon-credits`,
      method: 'POST',
      body: new FormData()
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`Testing: ${endpoint.name}`);
      
      const options = {
        method: endpoint.method,
        headers: {}
      };

      if (endpoint.body) {
        endpoint.body.append('latitude', '13.0827');
        endpoint.body.append('longitude', '77.5877');
        endpoint.body.append('area_hectares', '5.0');
        options.body = endpoint.body;
      }

      const response = await fetch(endpoint.url, options);
      const data = await response.json();
      
      console.log(`✅ ${endpoint.name}:`, JSON.stringify(data, null, 2));
      console.log('');
    } catch (error) {
      console.error(`❌ ${endpoint.name} error:`, error.message);
      console.log('');
    }
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting comprehensive forestation API tests...\n');
  
  await testForestationEndpoints();
  await testIndividualEndpoints();
  
  console.log('\n✨ All forestation API tests completed!');
  console.log('\n📋 Summary of implemented endpoints:');
  console.log('   POST /forestation/applications - Create forestation application');
  console.log('   GET  /forestation/applications - Get user applications');
  console.log('   POST /forestation/analysis - Save analysis results');
  console.log('   GET  /forestation/analysis - Get analysis results');
  console.log('   POST /forestation/mint-coin - Mint forestation coins');
  console.log('   GET  /forestation/mint-coin - Get minted coins');
  console.log('   POST /forestation/calculate-carbon-credits - Calculate credits');
  console.log('   GET  /forestation/health - Health check');
  console.log('   GET  /forestation/ - Module info');
}

// Check if running in Node.js environment
if (typeof fetch === 'undefined') {
  console.log('⚠️  This script requires Node.js 18+ with built-in fetch support');
  console.log('   Or install node-fetch: npm install node-fetch');
  process.exit(1);
}

runAllTests();
