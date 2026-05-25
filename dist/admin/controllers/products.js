"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = void 0;
const prisma_1 = require("../../lib/prisma");
const createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, imageUrl, categoryId } = req.body;
        const finalImageUrl = req.file ? `/uploads/${req.file.filename}` : imageUrl;
        const product = await prisma_1.prisma.product.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create product' });
    }
};
exports.createProduct = createProduct;
const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, description, price, stock, imageUrl, categoryId } = req.body;
        const finalImageUrl = req.file ? `/uploads/${req.file.filename}` : imageUrl;
        const product = await prisma_1.prisma.product.update({
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
