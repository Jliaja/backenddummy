import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

// Get JWT_SECRET dynamically inside functions to ensure dotenv has loaded
const getJwtSecret = () => process.env.JWT_SECRET || 'marketplacedummysecret';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, firstName, lastName, address } = req.body;
    
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already in use' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
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
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error', details: error.message, stack: error.stack });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, getJwtSecret(), { expiresIn: '1d' });

    res.status(200).json({ message: 'Login successful', token, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, address: user.address, role: user.role } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
