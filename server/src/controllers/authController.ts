import { Request, Response } from "express";
import db from '../util/db';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { jwtSign, jwtVerify, getJwt } from "../jwt/jwtAuth";
dotenv.config();

class AuthController {
    async login(req: Request, res: Response) {
        const potentialLogin = await db.query('SELECT * FROM users WHERE username = $1',
            [req.body.username]);
        if (potentialLogin.rowCount > 0) {
            const isSamePass = await bcrypt.compare(req.body.password, potentialLogin.rows[0].passhash);
            if (isSamePass) {
                jwtSign({
                    username: req.body.username,
                    id: potentialLogin.rows[0].id,
                    userid: potentialLogin.rows[0].userid
                }, process.env.JWT_SECRET, { expiresIn: '1d' })
                .then(token => {
                    res.json({ loggedIn: true, token });
                }).catch(err => {
                    console.log(err);
                    res.json({ loggedIn: false, status: 'Try again later!' })
                });
            } else {
                res.json({loggedIn: false, status: "Wrong username or password!"});
            }
        } else {
            res.json({loggedIn: false, status: "Wrong username or password!"});
        }
    }
    async checkIfLoggedIn(req: Request, res: Response) {
        const token = getJwt(req);
        if (token === 'null') {
            res.json({ loggedIn: false });
            return;
        }
        jwtVerify(token, process.env.JWT_SECRET)
            .then(decoded => {
                res.json({ loggedIn: true, token });
            }).catch(err => {
                res.json({ loggedIn: false });
            });
    }
    async signUp(req: Request, res: Response) {
        const existingUser = await db.query('SELECT username FROM users WHERE username = $1',
            [req.body.username]);
        if (existingUser.rowCount === 0) {
            const hashedPass = await bcrypt.hash(req.body.password, 10);
            const newUserQuery = await db.query('INSERT INTO users (username, passhash, userid) VALUES ($1, $2, $3) RETURNING id, username, userid', 
                [req.body.username, hashedPass, uuidv4()]);
            jwtSign({
                username: req.body.username,
                id: newUserQuery.rows[0].id,
                userid: newUserQuery.rows[0].userid
            }, process.env.JWT_SECRET, { expiresIn: '1min' })
            .then(token => {
                res.json({ loggedIn: true, token });
            }).catch(err => {
                console.log(err);
                res.json({ loggedIn: false, status: 'Try again later!' })
            });
        } else {
            res.json({loggedIn: false, status: 'Username is taken'});
        }
    }
}

const authController = new AuthController();
export default authController;