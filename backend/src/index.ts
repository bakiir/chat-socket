import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import http from 'http';
import mongoose from 'mongoose';
import authRouter from './auth/auth';
import usersRouter from './routes/users';
import chatsRouter from './routes/chats';
import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { Message } from './models/Message';
import { User } from './models/User';
import { Group } from './models/Group';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();
const server = http.createServer(app);

const io = new SocketIOServer(server, {
    cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});


io.use((socket: Socket, next)=>{
    const token = socket.handshake.auth.token;
    if(!token) return  next(new Error("Auth error"));

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET!) as {id:string, username:string};
        socket.data.user = payload
        next()
    }catch {
        next(new Error("Auth error"))
    }
})

const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
    console.error('FATAL ERROR: MONGO_URI is not defined.');
    process.exit(1);
}

// Move Mongoose connection here and wrap server start
mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('MongoDB connected...');

        io.use((socket: Socket, next)=>{
            const token = socket.handshake.auth.token;
            if(!token) return  next(new Error("Auth error"));

            try{
                const payload = jwt.verify(token, process.env.JWT_SECRET!) as {id:string, username:string};
                socket.data.user = payload
                next()
            }catch {
                next(new Error("Auth error"))
            }
        })

        io.on("connection", socket =>{
            console.log("user connected", socket.data.user.username)


            socket.on("join_room", (room:string)=>{
                socket.join(room)
                console.log(`${socket.data.user.username} joined room ${room}`)
            })

            socket.on("send_message",
                async (data:{content:string, receiver?: string,
                                    groupName?:string, isGroup:boolean})=>{
                const  sender = socket.data.user.username;
                const message = new Message({
                    sender,
                    content: data.content,
                    timestamp: new Date(),
                    isGroup: data.isGroup,
                    groupName: data.groupName,
                    receiver: data.receiver
                })

                    await message.save()
                    if (data.isGroup){
                        io.to(data.groupName!).emit("receive_message", message);
                    }else {
                        const room = [sender, data.receiver].sort().join("_");
                        io.to(room).emit("receive_message", message)
                    }
            })

            socket.on("disconnect", ()=>{
                console.log("User disconnected:", socket.data.user.username)
            })
        } )

        // Middlewares
        app.use(cors()); // Разрешаем CORS-запросы с фронтенда
        app.use(express.json()); // Для парсинга JSON-тел запросов

        // Routes
        app.use('/api/auth', authRouter);
        app.use('/api/users', usersRouter);
        app.use('/api/chats', chatsRouter);


        app.get('/', (req, res) => {
            res.send('Chat App Backend is running!');
        });

        server.listen(PORT, () => {
            console.log(`Server is running on http://localhost:${PORT}`);
        });
    })
    .catch(err => console.error('Could not connect to MongoDB...', err));

export default app;