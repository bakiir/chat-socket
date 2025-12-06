"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_1 = require("../models/User");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        // Find all users except the currently logged-in user
        const users = await User_1.User.find({ _id: { $ne: req.user.userId } }).select('username _id');
        res.json(users);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error while fetching users' });
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map