"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = require("../models/User"); // Import User model
const JWT_SECRET = process.env.JWT_SECRET;
const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authentication token required or malformed');
        return res.status(401).json({ message: 'Authentication token required' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const payload = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        console.log('JWT Payload:', payload);
        console.log('User model in authMiddleware:', User_1.User); // Added log
        const user = await User_1.User.findById(payload.id); // Line 25
        if (!user) {
            console.log('User not found for ID:', payload.id);
            return res.status(401).json({ message: 'User not found' });
        }
        req.user = {
            userId: user._id.toString(), // Use user._id as userId
            username: user.username // Use username from fetched user
        };
        console.log('req.user after assignment:', req.user);
        next();
    }
    catch (error) {
        console.error('JWT Verification Error:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
exports.authMiddleware = authMiddleware;
//# sourceMappingURL=auth.middleware.js.map