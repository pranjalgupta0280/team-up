// test-backend.js - Improved version
async function testBackend() {
  try {
    console.log('🧪 Testing backend endpoints...');
    
    // Test health endpoint
    const healthResponse = await fetch('http://localhost:5000/health');
    const health = await healthResponse.json();
    console.log('✅ Health check:', health.status);
    
    // Generate unique email for testing
    const testEmail = `test${Date.now()}@testcollege.com`;
    
    // Test signup
    console.log('📝 Testing signup...');
    const signupResponse = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Backend Tester',
        email: testEmail,
        password: 'password123',
        year: 3,
        branch: 'Testing'
      })
    });
    
    const signup = await signupResponse.json();
    if (signup.error) {
      console.log('❌ Signup failed:', signup.error);
    } else {
      console.log('✅ Signup successful');
    }
    
    // Test login with the newly created user
    console.log('🔐 Testing login with new user...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'password123'
      })
    });
    
    const login = await loginResponse.json();
    if (login.error) {
      console.log('❌ Login failed:', login.error);
    } else {
      console.log('✅ Login successful - Token received!');
    }
    
    // Test protected route with the token
    if (login.token) {
      console.log('🔒 Testing protected route...');
      const profileResponse = await fetch('http://localhost:5000/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${login.token}`
        }
      });
      
      const profile = await profileResponse.json();
      if (profile.error) {
        console.log('❌ Protected route failed:', profile.error);
      } else {
        console.log('✅ Protected route successful - User:', profile.user.name);
      }
    }
    
    console.log('🎉 Backend testing completed!');
    
  } catch (error) {
    console.log('❌ Test failed:', error.message);
  }
}

testBackend();