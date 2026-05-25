import { Request, Response } from 'express';
import { prisma } from '../../lib/prisma';

export const createProduct = async (req: Request, res: Response) => {
  try {
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    const backendUrl = process.env.API_URL ? process.env.API_URL.replace('/api', '') : `${req.protocol}://${req.get('host')}`;
    const finalImageUrl = req.file ? `${backendUrl}/uploads/${req.file.filename}` : imageUrl;
    
    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        imageUrl: finalImageUrl,
        categoryId
      },
      include: { category: true }
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
};

export const updateProduct = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { name, description, price, stock, imageUrl, categoryId } = req.body;
    const backendUrl = process.env.API_URL ? process.env.API_URL.replace('/api', '') : `${req.protocol}://${req.get('host')}`;
    const finalImageUrl = req.file ? `${backendUrl}/uploads/${req.file.filename}` : imageUrl;

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock, 10) || 0,
        imageUrl: finalImageUrl,
        categoryId
      },
      include: { category: true }
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
