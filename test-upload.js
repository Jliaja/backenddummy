const fs = require('fs');

async function test() {
  // 1. Login to get token
  const loginRes = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin' })
  });
  const loginData = await loginRes.json();
  if (!loginRes.ok) {
    console.error('Login failed:', loginData);
    return;
  }
  const token = loginData.token;
  
  // 2. Get a category ID
  const catRes = await fetch('http://localhost:5000/api/categories');
  const catData = await catRes.json();
  const categoryId = catData[0].id;

  // 3. Create dummy PNG
  fs.writeFileSync('dummy.png', Buffer.from([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 1, 0, 0, 0, 1, 8, 6, 0, 0, 0, 31, 21, 196, 137, 0, 0, 0, 13, 73, 68, 65, 84, 120, 156, 99, 252, 207, 240, 31, 0, 4, 136, 1, 41, 107, 74, 30, 201, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130]));
  
  // 4. Send multipart/form-data request
  const formData = new FormData();
  formData.append('name', 'Test Upload Product');
  formData.append('description', 'Testing upload');
  formData.append('price', '99.99');
  formData.append('stock', '10');
  formData.append('categoryId', categoryId);
  formData.append('imageUrl', '');
  
  const blob = new Blob([fs.readFileSync('dummy.png')], { type: 'image/png' });
  formData.append('image', blob, 'dummy.png');

  const res = await fetch('http://localhost:5000/api/admin/products', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });

  console.log('Status:', res.status);
  const data = await res.json();
  console.log('Response:', data);
}

test().catch(console.error);
