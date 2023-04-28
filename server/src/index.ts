import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import helmet from 'helmet';
import cors from 'cors';
import authRouter from './routers/authRouter';
import dotenv from 'dotenv';
import { authorizeUser, initializeUser, addFriend, onDisconnect } from './custom_middlewares/socketController';
import { dm } from './util/dm';

// configuring
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
});

// middlewares
app.use(helmet());
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

// routes
app.use('/auth', authRouter);

// socket connection and listening
io.use(authorizeUser);
io.on('connect', (socket) => {
    initializeUser(socket);
    socket.on('add_friend', (friendName: string, cb: CallableFunction) => {
        addFriend(socket, friendName, cb);
    });
    socket.on('dm', message => dm(socket, message))
    socket.on('disconnect', () => onDisconnect(socket));
});
server.listen(4000, () => console.log('Listening on port 4000...'));