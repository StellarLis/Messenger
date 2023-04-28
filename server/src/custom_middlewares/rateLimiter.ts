import { Request, Response, NextFunction } from "express";
import redisClient from "../util/redis";
import { RedisKey } from "ioredis";

const rateLimiter = (seconds: number, limitAmount: number) =>
    async (req: Request, res: Response, next: NextFunction) => {
        const ip = req.socket.remoteAddress as RedisKey;
        const [response] = await redisClient
            .multi()
            .incr(ip)
            .expire(ip, seconds)
            .exec();
        if (response[1] > limitAmount) {
            res.json({ loggedIn: false, status: 'Too many requests! Try again in a minute.' });
        } else {
            next();
        }
    }

export default rateLimiter;