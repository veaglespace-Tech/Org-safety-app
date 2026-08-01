const fs = require('fs');
const FormData = require('form-data');
const axios = require('axios');

async function testUpload() {
  try {
    // We need a dummy image
    fs.writeFileSync('dummy.jpg', 'fake image content');
    
    // We don't have a valid token, so we expect a 401 Unauthorized or 403.
    // If we get 401, it means the request reached the server.
    const form = new FormData();
    form.append('logo', fs.createReadStream('dummy.jpg'));
    
    console.log("Sending request to server...");
    const response = await axios.patch('http://localhost:5000/api/org/settings/logo', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: 'Bearer invalid_token'
      },
      validateStatus: () => true
    });
    
    console.log("Response status:", response.status);
    console.log("Response data:", response.data);
  } catch (error) {
    console.error("Axios Error:", error.message);
  }
}

testUpload();
