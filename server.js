const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

// Input validation middleware
const validateUserInput = (req, res, next) => {
  const { username, email, profileUrl } = req.body;
  
  // Check if all required fields are present
  if (!username || !email || !profileUrl) {
    return res.status(400).json({
      error: 'Missing required fields',
      required: ['username', 'email', 'profileUrl']
    });
  }
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email format'
    });
  }
  
  // Basic URL validation
  try {
    new URL(profileUrl);
  } catch (error) {
    return res.status(400).json({
      error: 'Invalid URL format for profileUrl'
    });
  }
  
  next();
};

// Function to scrape the external URL and extract the h1 tag content
const scrapeProfileData = async (url) => {
  try {
    console.log(`🔍 Scraping URL: ${url}`);
    
    // Make HTTP GET request to the profile URL
    const response = await axios.get(url, {
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    // Parse HTML content using Cheerio
    const $ = cheerio.load(response.data);
    
    // Extract text content from the first h1 tag
    const fullName = $('h1').first().text().trim();
    
    if (!fullName) {
      throw new Error('No h1 tag found or h1 tag is empty');
    }
    
    console.log(`✅ Successfully extracted full name: ${fullName}`);
    return fullName;
    
  } catch (error) {
    console.error(`❌ Error scraping URL: ${error.message || 'Unknown error'}`);
    console.error('Error details:', {
      code: error.code,
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
    
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      throw new Error('Unable to connect to the provided URL');
    } else if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - URL took too long to respond');
    } else if (error.response && error.response.status) {
      throw new Error(`HTTP ${error.response.status}: ${error.response.statusText}`);
    } else if (error.message === 'No h1 tag found or h1 tag is empty') {
      throw new Error('No h1 tag found or h1 tag is empty');
    } else {
      throw new Error(`Failed to scrape the profile URL: ${error.message || error.code || 'Unknown error'}`);
    }
  }
};

// Function to simulate database save operation
const simulateDatabaseSave = (userProfile) => {
  console.log('💾 Simulating database save...');
  console.log('User profile to be saved:', JSON.stringify(userProfile, null, 2));
  
  // Simulate some processing time
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('✅ User profile successfully saved to database (simulated)');
      resolve(userProfile);
    }, 100);
  });
};

// Main API endpoint: POST /users/enrich
app.post('/users/enrich', validateUserInput, async (req, res) => {
  try {
    console.log('\n🚀 Starting profile enrichment process...');
    console.log('📥 Received request:', JSON.stringify(req.body, null, 2));
    
    const { username, email, profileUrl } = req.body;
    
    // Step 1: Receive and Parse (already done by express.json() middleware)
    console.log('✅ Step 1: Request received and parsed');
    
    // Step 2: Scrape External URL
    console.log('🔄 Step 2: Scraping external URL...');
    const fullName = await scrapeProfileData(profileUrl);
    
    // Step 3: Extract Data (done within scrapeProfileData function)
    console.log('✅ Step 3: Data extracted from HTML');
    
    // Step 4: Combine Data
    console.log('🔄 Step 4: Combining data...');
    const enrichedProfile = {
      username,
      email,
      fullName,
      sourceProfile: profileUrl
    };
    console.log('✅ Step 4: Data combined successfully');
    
    // Step 5: Simulate Database Save
    console.log('🔄 Step 5: Simulating database save...');
    await simulateDatabaseSave(enrichedProfile);
    console.log('✅ Step 5: Database save completed');
    
    // Step 6: Return Response
    console.log('🔄 Step 6: Sending response...');
    console.log('📤 Final enriched profile:', JSON.stringify(enrichedProfile, null, 2));
    
    res.status(201).json(enrichedProfile);
    console.log('✅ Profile enrichment process completed successfully!\n');
    
  } catch (error) {
    console.error('❌ Error during profile enrichment:', error.message);
    
    res.status(500).json({
      error: 'Failed to enrich user profile',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Profile Enrichment Service'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: [
      'POST /users/enrich',
      'GET /health'
    ]
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    error: 'Internal server error',
    details: error.message
  });
});

// Start the server
const server = app.listen(PORT, () => {
  console.log(`🚀 Profile Enrichment Service running on port ${PORT}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST http://localhost:${PORT}/users/enrich`);
  console.log(`   GET  http://localhost:${PORT}/health`);
});

module.exports = { app, server };
