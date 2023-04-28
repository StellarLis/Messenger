"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = __importDefault(require("../util/redis"));
const rateLimiter = (seconds, limitAmount) => async (req, res, next) => {
    const ip = req.socket.remoteAddress;
    const [response] = await redis_1.default
        .multi()
        .incr(ip)
        .expire(ip, seconds)
        .exec();
    if (response[1] > limitAmount) {
        res.json({ loggedIn: false, status: 'Too many requests! Try again in a minute.' });
    }
    else {
        next();
    }
};
exports.default = rateLimiter;
