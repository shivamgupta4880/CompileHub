const axios = require('axios');

const API_URL = 'http://localhost:5000/api';

const runTestSuite = async () => {
  console.log('\n===========================================');
  console.log('🧪 COMPILEHUB SYSTEM TEST SUITE');
  console.log('===========================================\n');

  const testUser = {
    username: `tester_${Math.floor(Math.random() * 10000)}`,
    email: `test_${Math.floor(Math.random() * 10000)}@compilehub.com`,
    password: 'SuperSecurePassword123!',
  };

  let token = '';
  let snippetId = '';

  try {
    // 1. REGISTER
    console.log('🔄 1. Testing User Registration...');
    const registerRes = await axios.post(`${API_URL}/auth/register`, testUser);
    if (registerRes.data.success && registerRes.data.token) {
      console.log('✅ Registration: SUCCESS');
      token = registerRes.data.token;
    } else {
      throw new Error('Registration response did not return token');
    }

    // 2. LOGIN
    console.log('\n🔄 2. Testing User Login...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.password,
    });
    if (loginRes.data.success && loginRes.data.token) {
      console.log('✅ Login: SUCCESS');
    } else {
      throw new Error('Login response did not return token');
    }

    const authHeaders = {
      headers: { Authorization: `Bearer ${token}` },
    };

    // 3. GET PROFILE
    console.log('\n🔄 3. Testing Get Profile (/auth/me)...');
    const meRes = await axios.get(`${API_URL}/auth/me`, authHeaders);
    if (meRes.data.success && meRes.data.user.username === testUser.username) {
      console.log(`✅ Get Profile: SUCCESS (Welcome, ${meRes.data.user.username}!)`);
    } else {
      throw new Error('Profile response did not match registered user');
    }

    // 4. CODE EXECUTION
    console.log('\n🔄 4. Testing Code Execution Fallback (JavaScript)...');
    const executeRes = await axios.post(`${API_URL}/code/execute`, {
      language: 'javascript',
      code: 'const a = 10; const b = 20; console.log("Result is " + (a + b));',
    });
    if (executeRes.data.success && executeRes.data.result.stdout.trim() === 'Result is 30') {
      console.log('✅ Code Execution: SUCCESS (Output: Result is 30)');
    } else {
      throw new Error(`Execution failed or returned unexpected output: ${JSON.stringify(executeRes.data)}`);
    }

    // 5. SAVE SNIPPET
    console.log('\n🔄 5. Testing Create Snippet...');
    const snippetData = {
      title: 'Quick Test Snippet',
      code: 'console.log("Hello Test");',
      language: 'javascript',
    };
    const createSnippetRes = await axios.post(`${API_URL}/snippets`, snippetData, authHeaders);
    if (createSnippetRes.data.success && createSnippetRes.data.snippet._id) {
      snippetId = createSnippetRes.data.snippet._id;
      console.log(`✅ Create Snippet: SUCCESS (ID: ${snippetId})`);
    } else {
      throw new Error('Snippet creation failed');
    }

    // 6. GET ALL SNIPPETS
    console.log('\n🔄 6. Testing Fetch All Snippets...');
    const getSnippetsRes = await axios.get(`${API_URL}/snippets`, authHeaders);
    if (getSnippetsRes.data.success && getSnippetsRes.data.snippets.length > 0) {
      console.log(`✅ Fetch Snippets: SUCCESS (Found ${getSnippetsRes.data.snippets.length} snippet/s)`);
    } else {
      throw new Error('Fetch snippets failed or returned empty list');
    }

    // 7. UPDATE SNIPPET
    console.log('\n🔄 7. Testing Update Snippet...');
    const updateRes = await axios.put(
      `${API_URL}/snippets/${snippetId}`,
      { title: 'Updated Test Snippet Title' },
      authHeaders
    );
    if (updateRes.data.success && updateRes.data.snippet.title === 'Updated Test Snippet Title') {
      console.log('✅ Update Snippet: SUCCESS');
    } else {
      throw new Error('Update snippet failed');
    }

    // 8. DELETE SNIPPET
    console.log('\n🔄 8. Testing Delete Snippet...');
    const deleteRes = await axios.delete(`${API_URL}/snippets/${snippetId}`, authHeaders);
    if (deleteRes.data.success) {
      console.log('✅ Delete Snippet: SUCCESS');
    } else {
      throw new Error('Delete snippet failed');
    }

    console.log('\n===========================================');
    console.log('🎉 ALL TESTS COMPLETED SUCCESSFULLY! (8/8)');
    console.log('===========================================\n');
  } catch (error) {
    console.error('\n❌ TEST SUITE FAILED:', error.message);
    if (error.response) {
      console.error('Response Data:', JSON.stringify(error.response.data));
    }
    console.log('===========================================\n');
  }
};

runTestSuite();
