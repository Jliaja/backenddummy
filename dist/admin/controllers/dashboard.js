"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDashboardStats = void 0;
const prisma_1 = require("../../lib/prisma");
const getDashboardStats = async (req, res) => {
    try {
        const totalOrders = await prisma_1.prisma.order.count();
        const totalProducts = await prisma_1.prisma.product.count();
        const totalCategories = await prisma_1.prisma.category.count();
        const totalUsers = await prisma_1.prisma.user.count();
        const orders = await prisma_1.prisma.order.findMany();
        const totalRevenue = orders.reduce((acc, order) => acc + order.totalAmount, 0);
        const recentOrders = await prisma_1.prisma.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { firstName: true, lastName: true, email: true } } }
        });
        const orderItems = await prisma_1.prisma.orderItem.findMany();
        const totalProductsSold = orderItems.reduce((acc, item) => acc + item.quantity, 0);
        res.json({
            totalOrders,
            totalProducts,
            totalCategories,
            totalUsers,
            totalRevenue,
            totalProductsSold,
            recentOrders
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
