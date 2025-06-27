#!/usr/bin/env node

/**
 * Demo script for Profile Enrichment Service
 * This script demonstrates how to use the API programmatically
 */

const https = require('https');
const http = require('http');

async function testProfileEnrichment() {
  console.log('🎯 Profile Enrichment Service Demo\n');

  // Test cases
  const testCases = [
    {
      name: "Valid request with httpbin.org",
      data: {
        username: "johndoe",
        email: "john@example.com", 
        profileUrl: "https://httpbin.org/html"
      }
    },
    {
      name: "Valid request with example.com",
      data: {
        username: "janedoe",
        email: "jane@example.com",
        profileUrl: "https://example.com"
      }
    },
    {
      name: "Invalid email format",
      data: {
        username: "testuser",
        email: "invalid-email",
        profileUrl: "https://example.com"
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`📋 Testing: ${testCase.name}`);
    console.log(`📤 Request: ${JSON.stringify(testCase.data, null, 2)}`);
    
    try {
      const response = await makeRequest(testCase.data);
      console.log(`✅ Response (${response.statusCode}):`, JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
    }
    
    console.log('─'.repeat(60));
  }

  // Test health endpoint
  console.log('🏥 Testing health endpoint...');
  try {
    const healthResponse = await makeHealthRequest();
    console.log(`✅ Health check: ${JSON.stringify(healthResponse.data, null, 2)}`);
  } catch (error) {
    console.log(`❌ Health check failed: ${error.message}`);
  }
}

function makeRequest(data) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/users/enrich',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.write(postData);
    req.end();
  });
}

function makeHealthRequest() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/health',
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            data: parsedData
          });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${error.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`Request failed: ${error.message}`));
    });

    req.end();
  });
}

// Run the demo
if (require.main === module) {
  testProfileEnrichment().catch(console.error);
}

module.exports = { testProfileEnrichment };
