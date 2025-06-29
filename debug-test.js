const axios = require('axios');
const cheerio = require('cheerio');

async function testExampleCom() {
  try {
    console.log('🔍 Testing axios request to example.com...');
    
    const response = await axios.get('https://example.com', {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    console.log('✅ Response received!');
    console.log('Status:', response.status);
    console.log('Content-Type:', response.headers['content-type']);
    console.log('Data length:', response.data.length);
    console.log('First 200 chars of response:', response.data.substring(0, 200));
    
    const $ = cheerio.load(response.data);
    const h1Element = $('h1').first();
    const h1Text = h1Element.text().trim();
    
    console.log('H1 element found:', h1Element.length > 0);
    console.log('H1 text:', JSON.stringify(h1Text));
    console.log('H1 text length:', h1Text.length);
    
    if (!h1Text) {
      console.log('❌ No H1 text found or empty');
    } else {
      console.log('✅ H1 text successfully extracted:', h1Text);
    }
    
  } catch (error) {
    console.log('❌ Error occurred:');
    console.log('Message:', error.message || 'No message');
    console.log('Code:', error.code || 'No code');
    console.log('Stack:', error.stack);
    
    if (error.response) {
      console.log('Response status:', error.response.status);
      console.log('Response statusText:', error.response.statusText);
    }
  }
}

testExampleCom();
