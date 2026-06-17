describe('NeuraExplain Auth & Chat UI Tests', () => {

  const testUser = {
    name: `Test User ${Date.now()}`,
    email: `test${Date.now()}@testmail.com`,
    phone: '9876543210',
    password: 'TestPass@123'
  };

  const validUser = {
    email: 'thakuryashika14@gmail.com',
    password: 'Yashika@14'
  };

  // Test 1: Register a new user and verify OTP screen appears
  it('should register a new user and display OTP verification screen', () => {
    cy.visit('http://localhost:5173/register');

    // Wait for form to load
    cy.get('#name', { timeout: 10000 }).should('be.visible');

    // Fill registration form
    cy.get('#name').type(testUser.name);
    cy.get('#email').type(testUser.email);
    cy.get('#phone').type(testUser.phone);
    cy.get('#password').type(testUser.password);
    cy.get('#confirmPassword').type(testUser.password);

    // Submit form
    cy.get('button[type="submit"]').click();

    // Verify OTP screen appears
    cy.get('#otp-0', { timeout: 10000 }).should('be.visible');
    cy.get('#otp-1').should('be.visible');
    cy.get('#otp-5').should('be.visible');
  });

  // Test 2: Enter wrong OTP and verify error message
  it('should reject wrong OTP and display error message', () => {
    cy.visit('http://localhost:5173/register');

    // Fill registration form
    cy.get('#name').type(`WrongOTP Test ${Date.now()}`);
    cy.get('#email').type(`wrongotp${Date.now()}@testmail.com`);
    cy.get('#phone').type('9876543210');
    cy.get('#password').type('TestPass@123');
    cy.get('#confirmPassword').type('TestPass@123');

    // Submit
    cy.get('button[type="submit"]').click();

    // Wait for OTP screen to appear - wait for form to be gone first
    cy.get('#name', { timeout: 10000 }).should('not.exist');
    cy.get('#otp-0', { timeout: 15000 }).should('be.visible');

    // Enter wrong OTP (111111)
    for (let i = 0; i < 6; i++) {
      cy.get(`#otp-${i}`).type('1');
    }

    // Click Verify button
    cy.contains('button', 'Verify').click();

    // Verify error message appears and contains expected text
    cy.get('.registerError', { timeout: 10000 }).should('be.visible');
    cy.get('.registerError').should((el) => {
      const text = el.text();
      expect(text).to.satisfy((str) => 
        str.includes('Invalid OTP') || str.includes('Invalid or expired OTP')
      );
    });
  });

  // Test 3: Login with valid credentials
  it('should login user with valid credentials', () => {
    cy.visit('http://localhost:5173/login');

    // Wait for login form
    cy.get('input[type="email"]', { timeout: 10000 }).should('be.visible');
    cy.get('input[type="password"]').should('be.visible');

    // Fill login form
    cy.get('input[type="email"]').type(validUser.email);
    cy.get('input[type="password"]').type(validUser.password);

    // Click login button
    cy.get('button[type="submit"]').click();

    // Verify redirect to chat page
    cy.url({ timeout: 10000 }).should('include', '/chat');
    cy.get('.chatInput', { timeout: 10000 }).should('be.visible');
  });

  // Test 4: Test chat mode suggestion
  it('should suggest switching to General Mode for non-coding question in Technical Mode', () => {
    cy.visit('http://localhost:5173/login');

    // Login
    cy.get('input[type="email"]').type(validUser.email);
    cy.get('input[type="password"]').type(validUser.password);
    cy.get('button[type="submit"]').click();

    // Wait for chat page
    cy.url({ timeout: 10000 }).should('include', '/chat');
    cy.get('button.chatSelect', { timeout: 10000 }).should('be.visible');

    // Select Technical Mode
    cy.get('button.chatSelect').click();
    cy.contains('button', 'Technical Mode').click();

    // Ask a general question
    cy.get('.chatInput', { timeout: 10000 }).type('prime minister of india');
    cy.get('.chatSendButton').click();

    // Wait for AI response and verify it suggests switching modes
    cy.get('.chatRow.ai .chatBubbleText', { timeout: 15000 }).should('not.be.empty');
    cy.get('.chatRow.ai .chatBubbleText').should((el) => {
      const text = el.text().toLowerCase();
      expect(text).to.satisfy((str) => 
        str.includes('general mode') || str.includes('switch') || str.includes('general')
      );
    });
  });

  // Test 5: Test New Chat button resets composer
  it('should clear chat input when clicking New Chat button', () => {
    cy.visit('http://localhost:5173/login');

    // Login
    cy.get('input[type="email"]').type(validUser.email);
    cy.get('input[type="password"]').type(validUser.password);
    cy.get('button[type="submit"]').click();

    // Wait for chat page
    cy.url({ timeout: 10000 }).should('include', '/chat');
    cy.get('button.chatSelect', { timeout: 10000 }).should('be.visible');

    // Select Study Mode
    cy.get('button.chatSelect').click();
    cy.contains('button', 'Study Mode').click();

    // Send a message
    cy.get('.chatInput', { timeout: 10000 }).type('test question');
    cy.get('.chatSendButton').click();

    // Wait for response
    cy.get('.chatRow.ai .chatBubbleText', { timeout: 15000 }).should('not.be.empty');

    // Click New Chat
    cy.contains('button', 'New chat').click();

    // Verify input is cleared
    cy.get('.chatInput', { timeout: 10000 }).should('have.value', '');

    // Verify empty state appears
    cy.get('.chatEmptyState', { timeout: 10000 }).should('be.visible');

    // Verify history is still visible
    cy.get('.chatHistoryItem', { timeout: 10000 }).should('be.visible');
  });

  // Test 6: Test history mode filter
  it('should filter chat history by mode', () => {
    cy.visit('http://localhost:5173/login');

    // Login
    cy.get('input[type="email"]').type(validUser.email);
    cy.get('input[type="password"]').type(validUser.password);
    cy.get('button[type="submit"]').click();

    // Wait for chat page
    cy.url({ timeout: 10000 }).should('include', '/chat');
    cy.get('button.chatSelect', { timeout: 10000 }).should('be.visible');

    // Select Study Mode
    cy.get('button.chatSelect').click();
    cy.contains('button', 'Study Mode').click();

    // Send a unique message
    const uniqueMsg = `history filter test ${Date.now()}`;
    cy.get('.chatInput', { timeout: 10000 }).type(uniqueMsg);
    cy.get('.chatSendButton').click();

    // Wait for response
    cy.get('.chatRow.ai .chatBubbleText', { timeout: 15000 }).should('not.be.empty');

    // Open history filter dropdown and select Study Mode
    cy.get('aside select', { timeout: 10000 }).should('be.visible').select('study');

    // Verify history title contains Study Mode
    cy.get('.chatHistoryTitle', { timeout: 10000 }).should((el) => {
      expect(el.text().toLowerCase()).to.include('study mode');
    });

    // Verify at least one history item is visible
    cy.get('.chatHistoryItem', { timeout: 10000 }).should('have.length.greaterThan', 0);
  });

})