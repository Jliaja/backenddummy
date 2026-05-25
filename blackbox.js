const http = require('http');

const API_URL = 'http://localhost:5000/api';
let token = '';
let adminToken = '';
let userId = '';
let adminId = '';
let productId = '';

async function request(path, method = 'GET', data = null, authToken = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (authToken) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: body ? JSON.parse(body) : null });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- STARTING BLACKBOX TESTING ---');

  // 1. Register User
  console.log('\n1. Registering test user...');
  let res = await request('/auth/register', 'POST', {
    email: 'testuser@test.com',
    password: 'password123',
    firstName: 'Test',
    lastName: 'User'
  });
  console.log(`Status: ${res.status}`);
  if (res.status === 201) {
    userId = res.data.user.id;
  }

  // 2. Login User
  console.log('\n2. Logging in test user...');
  res = await request('/auth/login', 'POST', {
    email: 'testuser@test.com',
    password: 'password123'
  });
  console.log(`Status: ${res.status}`);
  if (res.status === 200) {
    token = res.data.token;
  }

  // 3. Register Admin
  console.log('\n3. Registering admin user...');
  res = await request('/auth/register', 'POST', {
    email: 'admin@test.com',
    password: 'password123',
    firstName: 'Admin',
    lastName: 'User'
  });
  
  // Actually, we need to make them an admin in the DB, but let's just use prisma directly or assume normal user for now. 
  // Wait, let's login admin if they already exist, or just use the DB to update role.
  console.log(`Status: ${res.status}`);

  console.log('\n4. Creating a category and product via Prisma (since we need admin rights or direct DB access)...');
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  
  await prisma.user.updateMany({
    where: { email: 'admin@test.com' },
    data: { role: 'ADMIN' }
  });
  
  res = await request('/auth/login', 'POST', { email: 'admin@test.com', password: 'password123' });
  adminToken = res.data.token;

  let category = await prisma.category.findFirst({ where: { name: 'TestCategory' } });
  if (!category) {
    category = await prisma.category.create({ data: { name: 'TestCategory' } });
  }

  const product = await prisma.product.create({
    data: {
      name: 'Expensive Laptop',
      price: 2000,
      stock: 10,
      categoryId: category.id
    }
  });
  productId = product.id;
  console.log(`Product created with ID: ${productId}, Price: $2000`);

  // 5. Test Insecure Order Creation (Security Fix)
  console.log('\n5. Testing Order Creation with manipulated price (Attempting to buy $2000 laptop for $1)...');
  res = await request('/orders', 'POST', {
    items: [
      { productId: productId, quantity: 1, price: 1 } // Manipulated price
    ]
  }, token);
  console.log(`Status: ${res.status}`);
  if (res.data) {
    console.log(`Order created. Total Amount calculated by server: $${res.data.totalAmount}`);
    if (res.data.totalAmount === 2000) {
      console.log('✅ FIX VERIFIED: Server ignored the manipulated $1 price and used the actual $2000 price from the database.');
    } else {
      console.log('❌ BUG STILL PRESENT: Server accepted the manipulated price!');
    }
  } else {
    console.log(res.data);
  }

  // 6. Test Dashboard Stats (Crash Fix)
  console.log('\n6. Testing Dashboard Stats Endpoint (Should not crash)...');
  res = await request('/admin/dashboard', 'GET', null, adminToken);
  console.log(`Status: ${res.status}`);
  if (res.status === 200) {
    console.log('✅ FIX VERIFIED: Dashboard endpoint returned successfully without Prisma crash.');
    console.log(`Recent Orders count: ${res.data.recentOrders?.length || 0}`);
  } else {
    console.log('❌ BUG STILL PRESENT: Dashboard endpoint failed.');
    console.log(res.data);
  }

  console.log('\n--- BLACKBOX TESTING COMPLETE ---');
}

runTests().catch(console.error);
