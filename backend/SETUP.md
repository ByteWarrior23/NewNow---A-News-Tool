# API Setup Guide

## News APIs ✅ (Already Working)
The following news APIs are already configured and working:
- **NewsAPI**: 4/5 keys working (1 key replaced with working key)
- **GNews**: 1/1 key working

## AI APIs ⚠️ (Need Configuration)
To enable AI features (news summaries, AI assistant), you need to configure these API keys:

### 1. Create .env file
Create a `.env` file in the backend directory with the following content:

```
# AI API Keys for News AI Assistant
# Get your OpenAI API key from: https://platform.openai.com/api-keys
OPENAI_API_KEY=your_openai_api_key_here

# Get your Gemini API key from: https://makersuite.google.com/app/apikey
GEMINI_API_KEY=your_gemini_api_key_here

# Optional: Server port (default is 5000)
PORT=5000
```

### 2. Get API Keys

#### OpenAI API Key:
1. Go to https://platform.openai.com/api-keys
2. Sign up/login to OpenAI
3. Create a new API key
4. Replace `your_openai_api_key_here` with your actual key

#### Gemini API Key:
1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Create a new API key
4. Replace `your_gemini_api_key_here` with your actual key

### 3. Test Configuration
After setting up the .env file, run:
```bash
node test-ai-apis-fixed.js
```

This will verify that your AI API keys are working correctly.

## Current Status
- ✅ News APIs: Working (5/6 total keys)
- ⚠️ AI APIs: Not configured (needs .env file setup)
- ✅ Fallback: Available for both news and AI features

The app will work without AI APIs, but AI features will show fallback messages. 