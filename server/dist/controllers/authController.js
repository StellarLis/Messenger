"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importDefault(require("../util/db"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const dotenv_1 = __importDefault(require("dotenv"));
const jwtAuth_1 = require("../jwt/jwtAuth");
dotenv_1.default.config();
class AuthController {
    async login(req, res) {
        const potentialLogin = await db_1.default.query('SELECT * FROM users WHERE username = $1', [req.body.username]);
        if (potentialLogin.rowCount > 0) {
            const isSamePass = await bcrypt_1.default.compare(req.body.password, potentialLogin.rows[0].passhash);
            if (isSamePass) {
                (0, jwtAuth_1.jwtSign)({
                    username: req.body.username,
                    id: potentialLogin.rows[0].id,
                    userid: potentialLogin.rows[0].userid
                }, process.env.JWT_SECRET, { expiresIn: '1d' })
                    .then(token => {
                    res.json({ loggedIn: true, token });
                }).catch(err => {
                    console.log(err);
                    res.json({ loggedIn: false, status: 'Try again later!' });
                });
            }
            else {
                res.json({ loggedIn: false, status: "Wrong username or password!" });
            }
        }
        else {
            res.json({ loggedIn: false, status: "Wrong username or password!" });
        }
    }
    async checkIfLoggedIn(req, res) {
        const token = (0, jwtAuth_1.getJwt)(req);
        if (token === 'null') {
            res.json({ loggedIn: false });
            return;
        }
        (0, jwtAuth_1.jwtVerify)(token, process.env.JWT_SECRET)
            .then(decoded => {
            res.json({ loggedIn: true, token });
        }).catch(err => {
            res.json({ loggedIn: false });
        });
    }
    async signUp(req, res) {
        const existingUser = await db_1.default.query('SELECT username FROM users WHERE username = $1', [req.body.username]);
        if (existingUser.rowCount === 0) {
            const hashedPass = await bcrypt_1.default.hash(req.body.password, 10);
            const newUserQuery = await db_1.default.query('INSERT INTO users (username, passhash, userid) VALUES ($1, $2, $3) RETURNING id, username, userid', [req.body.username, hashedPass, (0, uuid_1.v4)()]);
            (0, jwtAuth_1.jwtSign)({
                username: req.body.username,
                id: newUserQuery.rows[0].id,
                userid: newUserQuery.rows[0].userid
            }, process.env.JWT_SECRET, { expiresIn: '1min' })
                .then(token => {
                res.json({ loggedIn: true, token });
            }).catch(err => {
                console.log(err);
                res.json({ loggedIn: false, status: 'Try again later!' });
            });
        }
        else {
            res.json({ loggedIn: false, status: 'Username is taken' });
        }
    }
}
const authController = new AuthController();
exports.default = authController;
