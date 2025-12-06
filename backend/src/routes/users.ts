import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

interface AuthRequest extends Request {
    user?: { userId: string; username: string };
}

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        // Find all users except the currently logged-in user
        const users = await User.find({ _id: { $ne: req.user!.userId } }).select('username _id');
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
});

export default router;
