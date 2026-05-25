"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserOrders = exports.getOrders = exports.createOrder = void 0;
const prisma_1 = require("../lib/prisma");
const createOrder = async (req, res) => {
    try {
        const userId = req.user?.userId || req.body.userId;
        const { items } = req.body; // items: { productId, quantity, price }[]
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items provided' });
        }
        const totalAmount = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
        const order = await prisma_1.prisma.$transaction(async (tx) => {
            // Validate stock
            for (const item of items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) {
                    throw new Error(`Product ${item.productId} not found`);
                }
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
                }
            }
            // Decrement stock
            for (const item of items) {
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
                        create: items.map((item) => ({
                            productId: item.productId,
                            quantity: item.quantity,
                            price: item.price
                        }))
                    }
                },
                include: { items: true }
            });
        });
        res.status(201).json(order);
    }
    catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create order' });
    }
};
exports.createOrder = createOrder;
const getOrders = async (req, res) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            include: { items: { include: { product: true } }, user: { select: { id: true, firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getOrders = getOrders;
const getUserOrders = async (req, res) => {
    try {
        const orders = await prisma_1.prisma.order.findMany({
            where: { userId: req.user.userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
};
exports.getUserOrders = getUserOrders;
