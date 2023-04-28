import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { Request } from 'express';
dotenv.config();

export const jwtSign = (payload: object, secret: string, options: object) => new Promise((resolve, reject) => {
    jwt.sign(payload, secret, options, (err, token) => {
        if (err) reject(err);
        resolve(token);
    });
});

export const jwtVerify = (token: string, secret: string) => new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
        if (err) reject(err);
        resolve(decoded);
    })
})

export const getJwt = (req: Request) => req.headers['authorization']?.split(' ')[1];