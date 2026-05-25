import { Router } from 'express';
import { createOrder, getOrders, getUserOrders } from '../controllers/orderController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, createOrder);
router.get('/', getOrders); // Keep public or protected? Let's leave as is for dummy
router.get('/my-orders', authenticate, getUserOrders);

export default router;
