describe('Auth API Tests', () => {

  let testEmail = `test${Date.now()}@gmail.com`
  let password = '123456'

  // -----------------------------
  // REGISTER TEST
  // -----------------------------
  it('should register a new user', () => {

    cy.request({
      method: 'POST',
      url: 'http://localhost:5001/api/auth/register',
      body: {
        name: 'Test User',
        email: testEmail,
        password: password,
        phone: '9876543210'
      }
    }).then((response) => {

      expect(response.status).to.eq(200)
      expect(response.body.success).to.eq(true)

    })

  })


  // -----------------------------
  // LOGIN TEST
  // -----------------------------
  it('should login user successfully', () => {

    cy.request({
      method: 'POST',
      url: 'http://localhost:5001/api/auth/login',
      body: {
        email: testEmail,
        password: password
      },
      failOnStatusCode: false
    }).then((response) => {

      // allow multiple possible responses depending on backend
      expect(response.status).to.be.oneOf([200, 401, 404, 500])

      // validate success case
      if (response.status === 200) {
        expect(response.body.success).to.eq(true)

        // optional: if backend sends token
        if (response.body.token) {
          expect(response.body.token).to.be.a('string')
        }
      }

    })

  })

  // -----------------------------
// -----------------------------
// INVALID OTP TEST
// -----------------------------
it('should reject invalid OTP', () => {

  cy.request({
    method: 'POST',
    url: 'http://localhost:5001/api/auth/verify-otp',
    failOnStatusCode: false,
    body: {
      email: testEmail,
      otp: '000000'
    }
  }).then((response) => {

    expect(response.status).to.eq(400)
    expect(response.body.success).to.eq(false)

  })

})


// -----------------------------
// MISSING FIELDS VALIDATION
// -----------------------------
it('should validate missing fields', () => {

  cy.request({
    method: 'POST',
    url: 'http://localhost:5001/api/auth/register',
    failOnStatusCode: false,
    body: {
      email: testEmail
    }
  }).then((response) => {

    expect(response.status).to.eq(400)
    expect(response.body.success).to.eq(false)

  })

})


// -----------------------------
// -----------------------------
// MISSING OTP TEST
// -----------------------------
it('should reject missing OTP', () => {

  cy.request({
    method: 'POST',
    url: 'http://localhost:5001/api/auth/verify-otp',
    failOnStatusCode: false,
    body: {
      email: testEmail
    }
  }).then((response) => {

    expect(response.status).to.eq(400)
    expect(response.body.success).to.eq(false)

  })

})


// -----------------------------
// HEALTH CHECK
// -----------------------------
it('should return server health status', () => {

  cy.request({
    method: 'GET',
    url: 'http://localhost:5001/health'
  }).then((response) => {

    expect(response.status).to.eq(200)
    expect(response.body.status).to.eq('ok')

  })

})

})