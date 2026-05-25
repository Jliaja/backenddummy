const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanup() {
  console.log('--- STARTING CLEANUP ---');
  
  // Delete the items created by our blackbox script
  // The blackbox script created:
  // - testuser@test.com
  // - admin@test.com
  // - Product 'Expensive Laptop'
  // - Category 'TestCategory'
  // - Orders tied to these products/users
  
  // First, find the test users
  const testUsers = await prisma.user.findMany({
    where: { email: { in: ['testuser@test.com', 'admin@test.com'] } }
  });
  const userIds = testUsers.map(u => u.id);
  
  if (userIds.length > 0) {
    // Delete their orders and order items first
    const orders = await prisma.order.findMany({ where: { userId: { in: userIds } } });
    const orderIds = orders.map(o => o.id);
    
    if (orderIds.length > 0) {
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      console.log(`Deleted ${orderIds.length} test orders and associated items.`);
    }
    
    // Delete the test users
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    console.log(`Deleted ${userIds.length} test users.`);
  }

  // Delete test products
  const products = await prisma.product.findMany({ where: { name: 'Expensive Laptop' } });
  const productIds = products.map(p => p.id);
  if (productIds.length > 0) {
    // Just in case any other order items are tied to this product
    await prisma.orderItem.deleteMany({ where: { productId: { in: productIds } } });
    await prisma.product.deleteMany({ where: { id: { in: productIds } } });
    console.log(`Deleted ${productIds.length} test products.`);
  }

  // Delete test categories
  const categories = await prisma.category.findMany({ where: { name: 'TestCategory' } });
  const categoryIds = categories.map(c => c.id);
  if (categoryIds.length > 0) {
    await prisma.category.deleteMany({ where: { id: { in: categoryIds } } });
    console.log(`Deleted ${categoryIds.length} test categories.`);
  }

  console.log('--- CLEANUP COMPLETE ---');
}

cleanup().catch(console.error).finally(() => prisma.$disconnect());
