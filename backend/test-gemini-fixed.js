const fetch = require('node-fetch');

const GEMINI_API_KEY = 'AIzaSyBiZLDkINTvA5aqTTaqHpbhYnuAuKkURQo';

async function testGeminiModel(modelName, apiVersion = 'v1beta') {
  console.log(`🧠 Testing Gemini API with model: ${modelName} (${apiVersion})`);
  
  try {
    const url = `https://generativelanguage.googleapis.com/${apiVersion}/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ 
          parts: [{ text: 'Say "Hello" in one word.' }] 
        }],
      }),
    });
    
    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      console.log(`✅ Gemini API Key: WORKING with ${modelName}`);
      console.log(`   Response: "${data.candidates[0].content.parts[0].text.trim()}"`);
      return true;
    } else if (data.error) {
      console.log(`❌ Gemini API Key: FAILED - ${data.error.message}`);
      return false;
    } else {
      console.log(`❌ Gemini API Key: UNKNOWN ERROR with ${modelName}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ Gemini API Key: ERROR - ${err.message}`);
    return false;
  }
}

async function testAllGeminiModels() {
  console.log('🔍 Testing Gemini API with different models...\n');
  
  const models = [
    'gemini-pro',
    'gemini-1.5-pro',
    'gemini-1.5-flash',
    'gemini-pro-vision'
  ];
  
  const apiVersions = ['v1beta', 'v1'];
  
  for (const version of apiVersions) {
    for (const model of models) {
      const success = await testGeminiModel(model, version);
      if (success) {
        console.log(`\n✅ Found working model: ${model} with API version ${version}`);
        return { model, version };
      }
      console.log('');
    }
  }
  
  console.log('\n❌ No working Gemini models found');
  return null;
}

testAllGeminiModels(); 