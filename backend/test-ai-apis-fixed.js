const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function testOpenAI() {
  console.log('🤖 Testing OpenAI API...');
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('❌ OpenAI API Key: NOT CONFIGURED (missing from .env file)');
    console.log('   Current env vars:', Object.keys(process.env).filter(k => k.includes('OPENAI')));
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
    console.log('   Current env vars:', Object.keys(process.env).filter(k => k.includes('GEMINI')));
    return false;
  }
  
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
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
  console.log('📁 .env file path:', path.join(__dirname, '.env'));
  console.log('🔑 Environment variables loaded:', Object.keys(process.env).filter(k => k.includes('API_KEY')));
  console.log('');
  
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
}

testAllAIAPIs(); 