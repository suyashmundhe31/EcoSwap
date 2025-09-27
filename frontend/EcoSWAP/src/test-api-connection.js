// Simple test to check if the API is accessible
const API_BASE_URL = 'http://localhost:8000/api/v1';

async function testApiConnection() {
  try {
    console.log('Testing API connection...');
    
    // Test basic connectivity
    const response = await fetch(`${API_BASE_URL}/solar-panel/stats`);
    console.log('Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('API is accessible, response:', data);
    } else {
      console.log('API returned error status:', response.status);
    }
  } catch (error) {
    console.error('API connection failed:', error);
    console.log('Make sure the backend server is running on http://localhost:8000');
  }
}

// Run the test
testApiConnection();
