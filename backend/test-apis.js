const fetch = require('node-fetch');

// NewsAPI keys rotation
const NEWSAPI_KEYS = [
  'cef746d60bcb472495f74deff9156436',
  '2479479084c04b4d8278c0c474687c0e',
  'cef746d60bcb472495f74deff9156436',
  '3befea5a207042ada2bc0c15e097eb8b',
  '29b19221c70c4d6eaf44479bdca67d0b',
];
const GNEWS_API_KEY = 'a1111e26000d8f62f6362c05a5d01052';

async function testNewsAPIKey(apiKey, keyIndex) {
  try {
    const url = `https://newsapi.org/v2/everything?q=test&language=en&pageSize=1&apiKey=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log(`✅ NewsAPI Key ${keyIndex + 1}: WORKING`);
      return true;
    } else if (data.code === 'rateLimited' || data.code === 'apiKeyExhausted' || (data.message && data.message.includes('too many requests'))) {
      console.log(`⚠️  NewsAPI Key ${keyIndex + 1}: RATE LIMITED`);
      return false;
    } else {
      console.log(`❌ NewsAPI Key ${keyIndex + 1}: FAILED - ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ NewsAPI Key ${keyIndex + 1}: ERROR - ${err.message}`);
    return false;
  }
}

async function testGNewsKey() {
  try {
    const url = `https://gnews.io/api/v4/search?q=test&lang=en&max=1&apikey=${GNEWS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.articles) {
      console.log(`✅ GNews API Key: WORKING`);
      return true;
    } else {
      console.log(`❌ GNews API Key: FAILED - ${data.message || 'Unknown error'}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ GNews API Key: ERROR - ${err.message}`);
    return false;
  }
}

async function testAllAPIs() {
  console.log('🔍 Testing API Keys...\n');
  
  // Test NewsAPI keys
  console.log('📰 Testing NewsAPI Keys:');
  let workingNewsAPI = 0;
  for (let i = 0; i < NEWSAPI_KEYS.length; i++) {
    const isWorking = await testNewsAPIKey(NEWSAPI_KEYS[i], i);
    if (isWorking) workingNewsAPI++;
    await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second between requests
  }
  
  console.log('\n🌐 Testing GNews API Key:');
  const gnewsWorking = await testGNewsKey();
  
  console.log('\n📊 SUMMARY:');
  console.log(`NewsAPI Keys Working: ${workingNewsAPI}/${NEWSAPI_KEYS.length}`);
  console.log(`GNews API Key Working: ${gnewsWorking ? 'Yes' : 'No'}`);
  console.log(`Total Working APIs: ${workingNewsAPI + (gnewsWorking ? 1 : 0)}`);
  
  if (workingNewsAPI === 0 && !gnewsWorking) {
    console.log('\n⚠️  WARNING: No APIs are working! The app will use fallback data.');
  } else if (workingNewsAPI < 3) {
    console.log('\n⚠️  WARNING: Limited API availability. Consider adding more keys.');
  } else {
    console.log('\n✅ Good API availability!');
  }
}

testAllAPIs(); 