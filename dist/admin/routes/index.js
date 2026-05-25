"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../../middleware/auth");
const upload_1 = require("../../middleware/upload");
const validate_1 = require("../../middleware/validate");
const schema_1 = require("../../validators/schema");
const dashboard_1 = require("../controllers/dashboard");
const products_1 = require("../controllers/products");
const orders_1 = require("../controllers/orders");
const router = (0, express_1.Router)();
// Protect all admin routes
router.use(auth_1.authenticate, auth_1.isAdmin);
// Dashboard
router.get('/dashboard', dashboard_1.getDashboardStats);
// Products
router.post('/products', upload_1.upload.single('image'), (0, validate_1.validate)(schema_1.productSchema), products_1.createProduct);
router.put('/products/:id', upload_1.upload.single('image'), (0, validate_1.validate)(schema_1.productSchema), products_1.updateProduct);
router.delete('/products/:id', products_1.deleteProduct);
// Orders
router.get('/orders', orders_1.getAdminOrders);
router.put('/orders/:id/status', orders_1.updateOrderStatus);
exports.default = router;
