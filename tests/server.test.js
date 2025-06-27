const request = require('supertest');
const { app, server } = require('../server');

// Mock HTML content for testing
const mockHtmlWithH1 = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Profile</title>
</head>
<body>
    <h1>John Doe Smith</h1>
    <p>This is a test profile page</p>
</body>
</html>
`;

const mockHtmlWithoutH1 = `
<!DOCTYPE html>
<html>
<head>
    <title>Test Profile</title>
</head>
<body>
    <h2>Not an H1 tag</h2>
    <p>This page has no h1 tag</p>
</body>
</html>
`;

// Mock axios for testing
jest.mock('axios');
const axios = require('axios');

describe('Profile Enrichment Service', () => {
  afterAll(async () => {
    // Close the server after tests
    if (server) {
      await new Promise((resolve) => {
        server.close(resolve);
      });
    }
  });

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('POST /users/enrich', () => {
    const validRequest = {
      username: 'testuser',
      email: 'test@example.com',
      profileUrl: 'https://example.com/profile'
    };

    test('should successfully enrich user profile', async () => {
      // Mock successful axios response
      axios.get.mockResolvedValue({
        data: mockHtmlWithH1
      });

      const response = await request(app)
        .post('/users/enrich')
        .send(validRequest)
        .expect(201);

      expect(response.body).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'John Doe Smith',
        sourceProfile: 'https://example.com/profile'
      });

      // Verify axios was called with correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        'https://example.com/profile',
        expect.objectContaining({
          timeout: 10000,
          headers: expect.objectContaining({
            'User-Agent': expect.any(String)
          })
        })
      );
    });

    test('should return 400 if username is missing', async () => {
      const invalidRequest = {
        email: 'test@example.com',
        profileUrl: 'https://example.com/profile'
      };

      const response = await request(app)
        .post('/users/enrich')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Missing required fields',
        required: ['username', 'email', 'profileUrl']
      });
    });

    test('should return 400 if email is missing', async () => {
      const invalidRequest = {
        username: 'testuser',
        profileUrl: 'https://example.com/profile'
      };

      const response = await request(app)
        .post('/users/enrich')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Missing required fields',
        required: ['username', 'email', 'profileUrl']
      });
    });

    test('should return 400 if profileUrl is missing', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'test@example.com'
      };

      const response = await request(app)
        .post('/users/enrich')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Missing required fields',
        required: ['username', 'email', 'profileUrl']
      });
    });

    test('should return 400 for invalid email format', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'invalid-email',
        profileUrl: 'https://example.com/profile'
      };

      const response = await request(app)
        .post('/users/enrich')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid email format'
      });
    });

    test('should return 400 for invalid URL format', async () => {
      const invalidRequest = {
        username: 'testuser',
        email: 'test@example.com',
        profileUrl: 'not-a-url'
      };

      const response = await request(app)
        .post('/users/enrich')
        .send(invalidRequest)
        .expect(400);

      expect(response.body).toEqual({
        error: 'Invalid URL format for profileUrl'
      });
    });

    test('should return 500 if no h1 tag is found', async () => {
      // Mock response with no h1 tag
      axios.get.mockResolvedValue({
        data: mockHtmlWithoutH1
      });

      const response = await request(app)
        .post('/users/enrich')
        .send(validRequest)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to enrich user profile',
        details: 'No h1 tag found or h1 tag is empty'
      });
    });

    test('should return 500 if URL is unreachable', async () => {
      // Mock network error
      axios.get.mockRejectedValue({
        code: 'ENOTFOUND',
        message: 'getaddrinfo ENOTFOUND example.com'
      });

      const response = await request(app)
        .post('/users/enrich')
        .send(validRequest)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to enrich user profile',
        details: 'Unable to connect to the provided URL'
      });
    });

    test('should return 500 if request times out', async () => {
      // Mock timeout error
      axios.get.mockRejectedValue({
        code: 'ECONNABORTED',
        message: 'timeout of 10000ms exceeded'
      });

      const response = await request(app)
        .post('/users/enrich')
        .send(validRequest)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to enrich user profile',
        details: 'Request timeout - URL took too long to respond'
      });
    });

    test('should handle HTTP error responses', async () => {
      // Mock HTTP 404 error
      axios.get.mockRejectedValue({
        response: {
          status: 404,
          statusText: 'Not Found'
        }
      });

      const response = await request(app)
        .post('/users/enrich')
        .send(validRequest)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to enrich user profile',
        details: 'HTTP 404: Not Found'
      });
    });

    test('should handle empty h1 tag', async () => {
      // Mock response with empty h1 tag
      const emptyH1Html = `
        <!DOCTYPE html>
        <html>
        <body>
            <h1></h1>
        </body>
        </html>
      `;
      
      axios.get.mockResolvedValue({
        data: emptyH1Html
      });

      const response = await request(app)
        .post('/users/enrich')
        .send(validRequest)
        .expect(500);

      expect(response.body).toEqual({
        error: 'Failed to enrich user profile',
        details: 'No h1 tag found or h1 tag is empty'
      });
    });

    test('should extract text from h1 with nested elements', async () => {
      // Mock response with h1 containing nested elements
      const nestedH1Html = `
        <!DOCTYPE html>
        <html>
        <body>
            <h1>Jane <span>Doe</span> Johnson</h1>
        </body>
        </html>
      `;
      
      axios.get.mockResolvedValue({
        data: nestedH1Html
      });

      const response = await request(app)
        .post('/users/enrich')
        .send(validRequest)
        .expect(201);

      expect(response.body).toEqual({
        username: 'testuser',
        email: 'test@example.com',
        fullName: 'Jane Doe Johnson',
        sourceProfile: 'https://example.com/profile'
      });
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({
        status: 'OK',
        timestamp: expect.any(String),
        service: 'Profile Enrichment Service'
      });
    });
  });

  describe('404 handler', () => {
    test('should return 404 for unknown endpoints', async () => {
      const response = await request(app)
        .get('/unknown-endpoint')
        .expect(404);

      expect(response.body).toEqual({
        error: 'Endpoint not found',
        availableEndpoints: [
          'POST /users/enrich',
          'GET /health'
        ]
      });
    });
  });
});
