"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_js_1 = __importDefault(require("../models/User.js"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET)
    throw new Error("JWT_SECRET is not defined");
router.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password)
            return res.status(400).json({ message: "Барлық жолақты толтырыңыз!!!" });
        const candidate = await User_js_1.default.findOne({ username });
        if (candidate)
            return res.status(400).json({ message: "Пайдаланушы аты бірегей болуы керек!!!" });
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = new User_js_1.default({ username, password: hashedPassword });
        await user.save();
        return res.status(201).json({ message: "Сәтті тіркелдіңіз" });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Бірдеме дұрыс емес, қайта жасап көріңіз!!!" });
    }
});
router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User_js_1.default.findOne({ username });
        if (!user)
            return res.status(400).json({ message: "Пайдаланушы табылмады" });
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Қате пароль" });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });
        return res.json({ token, username: user.username });
    }
    catch (e) {
        console.error(e);
        return res.status(500).json({ message: "Қате серверде" });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map