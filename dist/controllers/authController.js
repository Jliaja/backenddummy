"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.register = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../lib/prisma");
// Get JWT_SECRET dynamically inside functions to ensure dotenv has loaded
const getJwtSecret = () => process.env.JWT_SECRET || 'marketplacedummysecret';
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, address } = req.body;
        const existingUser = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: 'Email already in use' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                firstName,
                lastName,
                address,
                role: 'USER'
            },
        });
        res.status(201).json({ message: 'User registered successfully', user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, address: user.address, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const isMatch = await bcrypt_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, getJwtSecret(), { expiresIn: '1d' });
        res.status(200).json({ message: 'Login successful', token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, address: user.address, role: user.role } });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
