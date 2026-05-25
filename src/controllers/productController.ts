import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;
    
    const search = req.query.search as string;
    const categoryId = req.query.categoryId as string;

    const where: any = {};
    
    if (search) {
      where.name = { contains: search };
    }
    
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
  console.error('GET PRODUCTS ERROR:', error);

  res.status(500).json({
    error: 'Failed to fetch products',
    details: error
  });
}
};

export const getProductById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const product = await prisma.product.findUnique({ where: { id }, include: { category: true } });
    if (!product) {
      res.status(404).json({ error: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, imageUrl, categoryId } = req.body;
    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price), imageUrl, categoryId }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, price, imageUrl, categoryId } = req.body;
    const product = await prisma.product.update({
      where: { id },
      data: { name, description, price: parseFloat(price), imageUrl, categoryId }
    });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
};

export const deleteProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    
    // Check if product is in any orders
    const orderItems = await prisma.orderItem.findFirst({ where: { productId: id } });
    if (orderItems) {
      res.status(400).json({ error: 'Cannot delete product because it has been ordered. Please disable or hide it instead.' });
      return;
    }

    await prisma.product.delete({ where: { id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
};
