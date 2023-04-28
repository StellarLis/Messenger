import { Socket } from "socket.io";
import redisClient from "./redis";

export const dm = async (socket: Socket, message: object) => {
    message.from = socket.user.userid;
    const messageString = [message.to, message.from, message.content].join('.');
    
    await redisClient.lpush(`chat:${message.to}`, messageString);
    await redisClient.lpush(`chat:${message.from}`, messageString);

    socket.to(message.to).emit('dm', message);
}