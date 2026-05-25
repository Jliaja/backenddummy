import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const totalOrders = await prisma.order.count();
    const totalProducts = await prisma.product.count();
    const totalCategories = await prisma.category.count();
    const totalUsers = await prisma.user.count();

    const orders = await prisma.order.findMany();
    const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);

    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true, email: true } } }
    });

    res.json({
      totalOrders,
      totalProducts,
      totalCategories,
      totalUsers,
      totalRevenue,
      recentOrders
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
