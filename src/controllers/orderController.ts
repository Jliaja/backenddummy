import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId || req.body.userId;
    const { items } = req.body; // items: { productId, quantity, price }[]
    
    if (!items || items.length === 0) {
      return res.status(400).json({ error: 'No items provided' });
    }

    const order = await prisma.$transaction(async (tx) => {
      let totalAmount = 0;
      const validatedItems = [];

      // Validate stock and get DB prices
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }
        
        totalAmount += product.price * item.quantity;
        validatedItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price
        });
      }

      // Decrement stock
      for (const item of validatedItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });
      }

      // Create order
      return await tx.order.create({
        data: {
          userId,
          totalAmount,
          items: {
            create: validatedItems
          }
        },
        include: { items: true }
      });
    });

    res.status(201).json(order);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Failed to create order' });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: { items: { include: { product: true } }, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

export const getUserOrders = async (req: any, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.userId },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};
