"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductById = exports.getProducts = void 0;
const prisma_1 = require("../lib/prisma");
const getProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const categoryId = req.query.categoryId;
        const where = {};
        if (search) {
            where.name = { contains: search };
        }
        if (categoryId) {
            where.categoryId = categoryId;
        }
        const [products, total] = await Promise.all([
            prisma_1.prisma.product.findMany({
                where,
                include: { category: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma_1.prisma.product.count({ where })
        ]);
        res.json({
            products,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};
exports.getProducts = getProducts;
const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await prisma_1.prisma.product.findUnique({ where: { id }, include: { category: true } });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};
exports.getProductById = getProductById;
const createProduct = async (req, res) => {
    try {
        const { name, description, price, imageUrl, categoryId } = req.body;
        const product = await prisma_1.prisma.product.create({
            data: { name, description, price: parseFloat(price), imageUrl, categoryId }
        });
        res.status(201).json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, price, imageUrl, categoryId } = req.body;
        const product = await prisma_1.prisma.product.update({
            where: { id },
            data: { name, description, price: parseFloat(price), imageUrl, categoryId }
        });
        res.json(product);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update product' });
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        await prisma_1.prisma.product.delete({ where: { id } });
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
};
exports.deleteProduct = deleteProduct;
