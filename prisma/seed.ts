import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Clear existing products and categories
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  // Ensure Admin exists
  const adminEmail = 'admin@gmail.com';
  let admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!admin) {
    const hashedPassword = await bcrypt.hash('admin', 10);
    await prisma.user.create({
      data: {
        firstName: 'System',
        lastName: 'Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'ADMIN',
      }
    });
  }

  // Create Categories
  const catElectronics = await prisma.category.create({ data: { name: 'Electronics' } });
  const catFashion = await prisma.category.create({ data: { name: 'Fashion' } });
  const catHome = await prisma.category.create({ data: { name: 'Home & Living' } });
  const catAccessories = await prisma.category.create({ data: { name: 'Accessories' } });
  const catSports = await prisma.category.create({ data: { name: 'Sports & Outdoors' } });

  // 30 Products Data
  const productsData = [
    // Electronics
    { name: 'Wireless Noise-Cancelling Headphones', price: 299.99, categoryId: catElectronics.id, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000' },
    { name: '4K Ultra HD Smart TV 55"', price: 499.00, categoryId: catElectronics.id, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=1000' },
    { name: 'Pro Gaming Laptop 15"', price: 1299.00, categoryId: catElectronics.id, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=1000' },
    { name: 'Smartphone 14 Pro Max', price: 1099.00, categoryId: catElectronics.id, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=1000' },
    { name: 'Mirrorless Digital Camera', price: 850.00, categoryId: catElectronics.id, stock: 10, imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000' },
    { name: 'Smartwatch Series 8', price: 399.00, categoryId: catElectronics.id, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1434493789847-2902a52dda8c?q=80&w=1000' },
    
    // Fashion
    { name: 'Classic Leather Jacket', price: 150.00, categoryId: catFashion.id, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=1000' },
    { name: 'Minimalist Cotton T-Shirt', price: 25.00, categoryId: catFashion.id, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1000' },
    { name: 'Denim Jeans Slim Fit', price: 65.00, categoryId: catFashion.id, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?q=80&w=1000' },
    { name: 'Running Sneakers Pro', price: 120.00, categoryId: catFashion.id, stock: 35, imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000' },
    { name: 'Summer Floral Dress', price: 45.00, categoryId: catFashion.id, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1515347619253-0665f8c6eb56?q=80&w=1000' },
    { name: 'Winter Wool Scarf', price: 30.00, categoryId: catFashion.id, stock: 80, imageUrl: 'https://images.unsplash.com/photo-1601004890684-d8cbf643f5f2?q=80&w=1000' },

    // Home & Living
    { name: 'Ceramic Coffee Mug Set', price: 35.00, categoryId: catHome.id, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?q=80&w=1000' },
    { name: 'Minimalist Desk Lamp', price: 45.00, categoryId: catHome.id, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1000' },
    { name: 'Cotton Bed Sheets King', price: 85.00, categoryId: catHome.id, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1522771731470-ea3c78822003?q=80&w=1000' },
    { name: 'Aromatherapy Diffuser', price: 28.00, categoryId: catHome.id, stock: 45, imageUrl: 'https://images.unsplash.com/photo-1608528577891-eb0558e80556?q=80&w=1000' },
    { name: 'Indoor Succulent Plant', price: 18.00, categoryId: catHome.id, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?q=80&w=1000' },
    { name: 'Velvet Throw Pillow', price: 22.00, categoryId: catHome.id, stock: 50, imageUrl: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?q=80&w=1000' },

    // Accessories
    { name: 'Polarized Aviator Sunglasses', price: 110.00, categoryId: catAccessories.id, stock: 30, imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000' },
    { name: 'Genuine Leather Wallet', price: 55.00, categoryId: catAccessories.id, stock: 75, imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?q=80&w=1000' },
    { name: 'Waterproof Canvas Backpack', price: 89.00, categoryId: catAccessories.id, stock: 40, imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=1000' },
    { name: 'Minimalist Silver Ring', price: 45.00, categoryId: catAccessories.id, stock: 100, imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b2548e?q=80&w=1000' },
    { name: 'Woven Straw Hat', price: 32.00, categoryId: catAccessories.id, stock: 25, imageUrl: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=1000' },
    { name: 'Nylon Apple Watch Band', price: 15.00, categoryId: catAccessories.id, stock: 120, imageUrl: 'https://images.unsplash.com/photo-1552822453-cb30e7135e5a?q=80&w=1000' },

    // Sports & Outdoors
    { name: 'Yoga Mat with Alignment Lines', price: 38.00, categoryId: catSports.id, stock: 60, imageUrl: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?q=80&w=1000' },
    { name: 'Stainless Steel Water Bottle', price: 24.00, categoryId: catSports.id, stock: 90, imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=1000' },
    { name: 'Adjustable Dumbbell Set', price: 199.00, categoryId: catSports.id, stock: 15, imageUrl: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?q=80&w=1000' },
    { name: 'Resistance Bands Set of 5', price: 18.00, categoryId: catSports.id, stock: 150, imageUrl: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?q=80&w=1000' },
    { name: 'Camping Tent 2-Person', price: 145.00, categoryId: catSports.id, stock: 20, imageUrl: 'https://images.unsplash.com/photo-1504280327387-5c3058cb0a6e?q=80&w=1000' },
    { name: 'High-Speed Jump Rope', price: 12.00, categoryId: catSports.id, stock: 200, imageUrl: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=1000' },
  ];

  for (const product of productsData) {
    await prisma.product.create({
      data: {
        name: product.name,
        description: `High-quality ${product.name.toLowerCase()} suitable for all your needs.`,
        price: product.price,
        stock: product.stock,
        imageUrl: product.imageUrl,
        categoryId: product.categoryId
      }
    });
  }

  console.log('Seeding completed: 5 Categories and 30 Products created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
