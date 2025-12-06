"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const auth_1 = __importDefault(require("./auth/auth"));
const users_1 = __importDefault(require("./routes/users"));
const chats_1 = __importDefault(require("./routes/chats"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Message_1 = require("./models/Message");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token)
        return next(new Error("Auth error"));
    try {
        const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        socket.data.user = payload;
        next();
    }
    catch {
        next(new Error("Auth error"));
    }
});
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}
// Move Mongoose connection here and wrap server start
mongoose_1.default.connect(MONGO_URI)
    .then(() => {
    console.log('MongoDB connected...');
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token)
            return next(new Error("Auth error"));
        try {
            const payload = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.user = payload;
            next();
        }
        catch {
            next(new Error("Auth error"));
        }
    });
    io.on("connection", socket => {
        console.log("user connected", socket.data.user.username);
        socket.on("join_room", (room) => {
            socket.join(room);
            console.log(`${socket.data.user.username} joined room ${room}`);
        });
        socket.on("send_message", async (data) => {
            const sender = socket.data.user.username;
            const message = new Message_1.Message({
                sender,
                content: data.content,
                timestamp: new Date(),
                isGroup: data.isGroup,
                groupName: data.groupName,
                receiver: data.receiver
            });
            await message.save();
            if (data.isGroup) {
                io.to(data.groupName).emit("receive_message", message);
            }
            else {
                const room = [sender, data.receiver].sort().join("_");
                io.to(room).emit("receive_message", message);
            }
        });
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.data.user.username);
        });
    });
    // Middlewares
    app.use((0, cors_1.default)()); // Разрешаем CORS-запросы с фронтенда
    app.use(express_1.default.json()); // Для парсинга JSON-тел запросов
    // Routes
    app.use('/api/auth', auth_1.default);
    app.use('/api/users', users_1.default);
    app.use('/api/chats', chats_1.default);
    app.get('/', (req, res) => {
        res.send('Chat App Backend is running!');
    });
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
})
    .catch(err => console.error('Could not connect to MongoDB...', err));
exports.default = app;
//# sourceMappingURL=index.js.map