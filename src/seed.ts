import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Electronics' },
    { name: 'Accessories' },
    { name: 'Peripherals' },
    { name: 'Smart Home' },
  ];

  // Upsert categories
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: { name: cat.name },
    });
  }

  // Seed Admin Account
  const adminPassword = await bcrypt.hash('admin', 10);
  await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      email: 'admin@gmail.com',
      password: adminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      address: 'Admin HQ',
      role: 'ADMIN',
    },
  });
  
  // Get categories to link products
  const electronicsCat = await prisma.category.findUnique({ where: { name: 'Electronics' } });
  const accessoriesCat = await prisma.category.findUnique({ where: { name: 'Accessories' } });
  const peripheralsCat = await prisma.category.findUnique({ where: { name: 'Peripherals' } });
  
  // Seed products
  if (electronicsCat && accessoriesCat && peripheralsCat) {
    const products = [
      {
        name: 'Nexus Pro Smartphone',
        description: 'The latest flagship smartphone with a stunning OLED display and advanced camera system.',
        price: 999.99,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=800&auto=format&fit=crop',
        categoryId: electronicsCat.id
      },
      {
        name: 'Aero Noise Cancelling Headphones',
        description: 'Premium wireless headphones with active noise cancellation and 40-hour battery life.',
        price: 299.99,
        stock: 120,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
        categoryId: accessoriesCat.id
      },
      {
        name: 'Ergo Mechanical Keyboard',
        description: 'Ergonomic mechanical keyboard with tactile switches for ultimate typing comfort.',
        price: 149.99,
        stock: 75,
        imageUrl: 'https://images.unsplash.com/photo-1595225476474-87563907a212?q=80&w=800&auto=format&fit=crop',
        categoryId: peripheralsCat.id
      },
      {
        name: 'UltraWide 4K Monitor',
        description: '34-inch curved ultrawide monitor perfect for productivity and gaming.',
        price: 799.99,
        stock: 20,
        imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=800&auto=format&fit=crop',
        categoryId: peripheralsCat.id
      }
    ];

    for (const prod of products) {
      // Create if it doesn't exist by name
      const exists = await prisma.product.findFirst({ where: { name: prod.name } });
      if (!exists) {
        await prisma.product.create({ data: prod });
      }
    }
  }

  console.log('Successfully seeded categories, products, and admin account!');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
