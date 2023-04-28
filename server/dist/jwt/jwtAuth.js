"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJwt = exports.jwtVerify = exports.jwtSign = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const jwtSign = (payload, secret, options) => new Promise((resolve, reject) => {
    jsonwebtoken_1.default.sign(payload, secret, options, (err, token) => {
        if (err)
            reject(err);
        resolve(token);
    });
});
exports.jwtSign = jwtSign;
const jwtVerify = (token, secret) => new Promise((resolve, reject) => {
    jsonwebtoken_1.default.verify(token, secret, (err, decoded) => {
        if (err)
            reject(err);
        resolve(decoded);
    });
});
exports.jwtVerify = jwtVerify;
const getJwt = (req) => req.headers['authorization']?.split(' ')[1];
exports.getJwt = getJwt;
