"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const orderController_1 = require("../controllers/orderController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.post('/', auth_1.authenticate, orderController_1.createOrder);
router.get('/', orderController_1.getOrders); // Keep public or protected? Let's leave as is for dummy
router.get('/my-orders', auth_1.authenticate, orderController_1.getUserOrders);
exports.default = router;
