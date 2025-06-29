# Video Demo Commands

## 1. Show Project Structure
ls -la

## 2. Show Package Dependencies
cat package.json

## 3. Install Dependencies
npm install

## 4. Run All Tests
npm test

## 5. Start Server (Terminal 1)
npm start

## 6. Test Health Endpoint (Terminal 2)
curl http://localhost:3000/health

## 7. Test Valid Request with httpbin.org
curl -X POST http://localhost:3000/users/enrich -H "Content-Type: application/json" -d '{"username": "johndoe", "email": "john@example.com", "profileUrl": "https://httpbin.org/html"}'

## 8. Test Valid Request with httpbin.org (second test)
curl -X POST http://localhost:3000/users/enrich -H "Content-Type: application/json" -d '{"username": "janedoe", "email": "jane@example.com", "profileUrl": "https://httpbin.org/html"}'

## 9. Test Missing Username Error
curl -X POST http://localhost:3000/users/enrich -H "Content-Type: application/json" -d '{"email": "test@example.com", "profileUrl": "https://example.com"}'

## 10. Test Invalid Email Error
curl -X POST http://localhost:3000/users/enrich -H "Content-Type: application/json" -d '{"username": "testuser", "email": "invalid-email", "profileUrl": "https://example.com"}'

## 11. Test Invalid URL Error
curl -X POST http://localhost:3000/users/enrich -H "Content-Type: application/json" -d '{"username": "testuser", "email": "test@example.com", "profileUrl": "not-a-url"}'

## 12. Test 404 Endpoint
curl http://localhost:3000/unknown-endpoint

## 13. Stop Server
Ctrl+C
