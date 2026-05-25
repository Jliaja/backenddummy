"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminOrders = exports.updateOrderStatus = void 0;
const prisma_1 = require("../../lib/prisma");
const updateOrderStatus = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!['PENDING', 'PAID', 'SHIPPED', 'COMPLETED'].includes(status)) {
            res.status(400).json({ error: 'Invalid status' });
            return;
        }
        const order = await prisma_1.prisma.order.update({
            where: { id },
            data: { status },
            include: {
                user: { select: { firstName: true, lastName: true, email: true } }
            }
        });
        res.json(order);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
};
exports.updateOrderStatus = updateOrderStatus;
const getAdminOrders = async (req, res) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                user: { select: { firstName: true, lastName: true, email: true } }
            }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getAdminOrders = getAdminOrders;
