// Simple test to check server connectivity
async function testConnection() {
  const urls = [
    'http://localhost:3001/health',
    'http://127.0.0.1:3001/health',
    'http://0.0.0.0:3001/health'
  ];

  for (const url of urls) {
    console.log(`\nTesting ${url}...`);
    try {
      const response = await fetch(url);
      console.log(`Status: ${response.status}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', JSON.stringify(data, null, 2));
      } else {
        console.log('Response not OK');
      }
    } catch (error) {
      console.log(`Error: ${error.message}`);
    }
  }
}

testConnection();