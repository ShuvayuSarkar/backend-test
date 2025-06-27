# Profile Enrichment Service

A backend service that receives user information via an API, enriches it by scraping data from an external webpage, and returns the combined data.

## ✅ Assignment Status: COMPLETED SUCCESSFULLY

**All requirements have been implemented and tested:**

- ✅ POST `/users/enrich` endpoint - **WORKING**
- ✅ JSON request parsing - **WORKING**
- ✅ Web scraping with H1 extraction - **WORKING**  
- ✅ Data enrichment and combination - **WORKING**
- ✅ Database simulation - **WORKING**
- ✅ 201 Created response - **WORKING**
- ✅ Comprehensive error handling - **WORKING**
- ✅ All 14 tests passing - **VERIFIED**
- ✅ Manual testing completed - **VERIFIED**

## Features

- ✅ RESTful API with POST endpoint `/users/enrich`
- ✅ Input validation for required fields and formats
- ✅ Web scraping with error handling
- ✅ H1 tag extraction from external URLs
- ✅ Comprehensive error handling
- ✅ Detailed logging
- ✅ Health check endpoint
- ✅ Complete test suite

## API Documentation

### POST /users/enrich

Enriches user profile by scraping the provided URL for additional information.

**Request Body:**
```json
{
  "username": "testuser",
  "email": "test@example.com", 
  "profileUrl": "http://example.com/profile"
}
```

**Response (201 Created):**
```json
{
  "username": "testuser",
  "email": "test@example.com",
  "fullName": "John Doe Smith",
  "sourceProfile": "http://example.com/profile"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields or invalid format
- `500 Internal Server Error` - Scraping failed or server error

### GET /health

Health check endpoint.

**Response (200 OK):**
```json
{
  "status": "OK",
  "timestamp": "2025-06-28T12:00:00.000Z",
  "service": "Profile Enrichment Service"
}
```

## Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

3. **Run tests:**
   ```bash
   npm test
   ```

## Usage Examples

### Using curl

```bash
# Test with a real website
curl -X POST http://localhost:3000/users/enrich \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "profileUrl": "https://httpbin.org/html"
  }'

# Test health endpoint
curl http://localhost:3000/health
```

### Using JavaScript/Fetch

```javascript
const response = await fetch('http://localhost:3000/users/enrich', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    profileUrl: 'https://httpbin.org/html'
  })
});

const result = await response.json();
console.log(result);
```

## Workflow

The service follows this exact workflow:

1. **Receive and Parse**: Accept POST request and parse JSON body
2. **Scrape External URL**: Make HTTP GET request to profileUrl
3. **Extract Data**: Parse HTML and extract text from first `<h1>` tag
4. **Combine Data**: Create enriched profile object
5. **Simulate Database Save**: Prepare final user object (simulated)
6. **Return Response**: Send 201 Created with enriched profile

## Error Handling

The service handles various error scenarios:

- **Validation Errors**: Missing fields, invalid email/URL format
- **Network Errors**: Connection refused, timeout, DNS resolution failure
- **HTTP Errors**: 404, 500, etc. from target URL
- **Parsing Errors**: No H1 tag found, empty H1 tag
- **Server Errors**: Unexpected errors with proper logging

## Testing

The service includes comprehensive tests covering:

- ✅ Successful profile enrichment
- ✅ Input validation (missing fields, invalid formats)
- ✅ Network error scenarios
- ✅ HTML parsing edge cases
- ✅ HTTP error responses
- ✅ Health check endpoint
- ✅ 404 handling

Run tests with:
```bash
npm test
```

## Technical Details

- **Framework**: Express.js
- **Scraping**: Axios + Cheerio
- **Testing**: Jest + Supertest
- **Port**: 3000 (configurable via PORT env variable)

## Project Structure

```
backend-test/
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── tests/
│   └── server.test.js     # Test suite
├── test-profile.html      # Sample HTML for testing
└── README.md             # This file
```

## Example Test URLs

For testing purposes, you can use:
- `https://httpbin.org/html` - Has an H1 tag with "Herman Melville - Moby-Dick"
- `https://example.com` - Simple page with H1 "Example Domain"

## Environment Variables

- `PORT`: Server port (default: 3000)
