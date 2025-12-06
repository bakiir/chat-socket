import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User'; // Import User model

const JWT_SECRET = process.env.JWT_SECRET!;

interface AuthRequest extends Request {
    user?: { userId: string; username: string };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => { // Make middleware async
    const authHeader = req.headers.authorization;
    console.log('Received authHeader:', authHeader); // Added log
    console.log('Using JWT_SECRET (first 5 chars):', JWT_SECRET.substring(0, 5)); // Added log, showing only first 5 chars for security

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authentication token required or malformed');
        return res.status(401).json({ message: 'Authentication token required' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { userId: string; iat: number; exp: number };
        console.log('JWT Payload:', payload);

        console.log('User model in authMiddleware:', User); // Added log
        const user = await User.findById(payload.userId); // Line 25

        if (!user) {
            console.log('User not found for ID:', payload.userId);
            return res.status(401).json({ message: 'User not found' });
        }

        req.user = {
            userId: user._id.toString(), // Use user._id as userId
            username: user.username // Use username from fetched user
        };
        console.log('req.user after assignment:', req.user);
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
