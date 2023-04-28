"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dm = void 0;
const redis_1 = __importDefault(require("./redis"));
const dm = async (socket, message) => {
    message.from = socket.user.userid;
    const messageString = [message.to, message.from, message.content].join('.');
    await redis_1.default.lpush(`chat:${message.to}`, messageString);
    await redis_1.default.lpush(`chat:${message.from}`, messageString);
    socket.to(message.to).emit('dm', message);
};
exports.dm = dm;
