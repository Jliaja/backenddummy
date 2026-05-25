import { Router } from 'express';
import { authenticate, isAdmin } from '../../middleware/auth';
import { upload } from '../../middleware/upload';
import { validate } from '../../middleware/validate';
import { productSchema } from '../../validators/schema';
import { getDashboardStats } from '../controllers/dashboard';
import { createProduct, updateProduct, deleteProduct } from '../controllers/products';

import { updateOrderStatus, getAdminOrders } from '../controllers/orders';

const router = Router();

// Protect all admin routes
router.use(authenticate, isAdmin);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Products
router.post('/products', upload.single('image'), validate(productSchema), createProduct);
router.put('/products/:id', upload.single('image'), validate(productSchema), updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.get('/orders', getAdminOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;
