const jwt = require('jsonwebtoken');
const { protect } = require('./auth');
const User = require('../models/User');
require('dotenv').config();

// Mock request, response, and next function
const createMockRequest = (headers = {}, cookies = {}) => ({
  headers,
  cookies,
  user: null
});

const createMockResponse = () => {
  const res = {};
  res.status = function(code) {
    this.statusCode = code;
    return this;
  };
  res.json = function(data) {
    this.responseData = data;
    return this;
  };
  return res;
};

const next = function() {
  this.called = true;
};

// Test the auth middleware
async function runAuthTests() {
  try {
    console.log('Starting auth middleware tests...\n');

    // Test Case 1: No token provided
    console.log('Test 1: No token provided');
    const req1 = createMockRequest();
    const res1 = createMockResponse();
    await protect(req1, res1, next.bind({}));
    console.log('Status:', res1.statusCode === 401 ? 'PASS' : 'FAIL');
    console.log('Response:', res1.responseData);
    console.log('---\n');

    // Create a test user for token generation
    const testUser = await User.create({
      name: 'Test User',
      email: `test-${Date.now()}@example.com`,
      password: 'password123',
      role: 'user'
    });
    
    // Generate a valid token
    const token = testUser.getSignedJwtToken();
    
    // Test Case 2: Valid token in Authorization header
    console.log('Test 2: Valid token in Authorization header');
    const req2 = createMockRequest({
      authorization: `Bearer ${token}`
    });
    const res2 = createMockResponse();
    const next2 = next.bind({});
    await protect(req2, res2, next2);
    console.log('Status:', req2.user ? 'PASS - User authenticated' : 'FAIL - User not authenticated');
    console.log('User ID:', req2.user?.id);
    console.log('---\n');

    // Test Case 3: Valid token in cookies
    console.log('Test 3: Valid token in cookies');
    const req3 = createMockRequest({}, { token });
    const res3 = createMockResponse();
    const next3 = next.bind({});
    await protect(req3, res3, next3);
    console.log('Status:', req3.user ? 'PASS - User authenticated' : 'FAIL - User not authenticated');
    console.log('User ID:', req3.user?.id);
    console.log('---\n');

    // Test Case 4: Invalid token
    console.log('Test 4: Invalid token');
    const req4 = createMockRequest({
      authorization: 'Bearer invalidtoken123'
    });
    const res4 = createMockResponse();
    await protect(req4, res4, next.bind({}));
    console.log('Status:', res4.statusCode === 401 ? 'PASS' : 'FAIL');
    console.log('Response:', res4.responseData);
    console.log('---\n');

    // Clean up
    await User.findByIdAndDelete(testUser._id);
    console.log('Test user cleaned up');
    console.log('\nAll tests completed!');

  } catch (error) {
    console.error('Test Error:', error);
  }
}

// Run the tests
runAuthTests();
