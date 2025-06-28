const fetch = require('node-fetch');
require('dotenv').config();

async function testOpenAI() {
  console.log('🤖 Testing OpenAI API...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API Key: NOT CONFIGURED (missing from .env file)');
    return false;
  }
  
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: 'Say "Hello" in one word.' },
        ],
        max_tokens: 10,
        temperature: 0.7,
      }),
    });
    
    const data = await response.json();
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      console.log('✅ OpenAI API Key: WORKING');
      console.log(`   Response: "${data.choices[0].message.content.trim()}"`);
      return true;
    } else if (data.error) {
      if (data.error.code === 'insufficient_quota') {
        console.log('⚠️  OpenAI API Key: QUOTA EXHAUSTED');
      } else if (data.error.code === 'invalid_api_key') {
        console.log('❌ OpenAI API Key: INVALID KEY');
      } else {
        console.log(`❌ OpenAI API Key: FAILED - ${data.error.message}`);
      }
      return false;
    } else {
      console.log('❌ OpenAI API Key: UNKNOWN ERROR');
      return false;
    }
  } catch (err) {
    console.log(`❌ OpenAI API Key: ERROR - ${err.message}`);
    return false;
  }
}

async function testGemini() {
  console.log('\n🧠 Testing Gemini API...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.log('❌ Gemini API Key: NOT CONFIGURED (missing from .env file)');
    return false;
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`;
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
      console.log('✅ Gemini API Key: WORKING');
      console.log(`   Response: "${data.candidates[0].content.parts[0].text.trim()}"`);
      return true;
    } else if (data.error) {
      if (data.error.code === 429) {
        console.log('⚠️  Gemini API Key: RATE LIMITED');
      } else if (data.error.code === 400) {
        console.log('❌ Gemini API Key: INVALID KEY');
      } else {
        console.log(`❌ Gemini API Key: FAILED - ${data.error.message}`);
      }
      return false;
    } else {
      console.log('❌ Gemini API Key: UNKNOWN ERROR');
      return false;
    }
  } catch (err) {
    console.log(`❌ Gemini API Key: ERROR - ${err.message}`);
    return false;
  }
}

async function testAllAIAPIs() {
  console.log('🔍 Testing AI Bot APIs...\n');
  
  const openaiWorking = await testOpenAI();
  const geminiWorking = await testGemini();
  
  console.log('\n📊 AI APIs SUMMARY:');
  console.log(`OpenAI API Working: ${openaiWorking ? 'Yes' : 'No'}`);
  console.log(`Gemini API Working: ${geminiWorking ? 'Yes' : 'No'}`);
  console.log(`Total AI APIs Working: ${(openaiWorking ? 1 : 0) + (geminiWorking ? 1 : 0)}`);
  
  if (!openaiWorking && !geminiWorking) {
    console.log('\n⚠️  WARNING: No AI APIs are working! AI features will use fallback responses.');
  } else if (!openaiWorking || !geminiWorking) {
    console.log('\n⚠️  WARNING: Limited AI API availability. Some AI features may not work.');
  } else {
    console.log('\n✅ Excellent AI API availability!');
  }
  
  console.log('\n💡 To configure AI APIs:');
  console.log('1. Create a .env file in the backend folder');
  console.log('2. Add your API keys:');
  console.log('   OPENAI_API_KEY=your_openai_key_here');
  console.log('   GEMINI_API_KEY=your_gemini_key_here');
}

testAllAIAPIs(); 