const fetch = require('node-fetch');

async function testServer() {
  console.log('🔍 Testing Backend Server...\n');
  
  try {
    // Test news API
    console.log('📰 Testing News API...');
    const response = await fetch('http://localhost:5000/api/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'test',
        page: 1
      }),
    });
    
    const data = await response.json();
    
    if (data.status === 'ok' && data.articles) {
      console.log('✅ News API: WORKING');
      console.log(`   Articles returned: ${data.articles.length}`);
      console.log(`   Total results: ${data.totalResults}`);
    } else {
      console.log('❌ News API: FAILED');
      console.log('   Response:', JSON.stringify(data, null, 2));
    }
    
    // Test GNews API
    console.log('\n🌐 Testing GNews API...');
    const gnewsResponse = await fetch('http://localhost:5000/api/gnews', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: 'test',
        page: 1
      }),
    });
    
    const gnewsData = await gnewsResponse.json();
    
    if (gnewsData.articles) {
      console.log('✅ GNews API: WORKING');
      console.log(`   Articles returned: ${gnewsData.articles.length}`);
    } else {
      console.log('❌ GNews API: FAILED');
      console.log('   Response:', JSON.stringify(gnewsData, null, 2));
    }
    
    console.log('\n✅ Server is running and APIs are responding!');
    
  } catch (err) {
    console.log('❌ Server test failed:', err.message);
    console.log('Make sure the server is running on port 5000');
  }
}

testServer(); 