"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onDisconnect = exports.addFriend = exports.initializeUser = exports.authorizeUser = void 0;
const redis_1 = __importDefault(require("../util/redis"));
const jwtAuth_1 = require("../jwt/jwtAuth");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const authorizeUser = async (socket, next) => {
    const token = socket.handshake.auth.token;
    (0, jwtAuth_1.jwtVerify)(token, process.env.JWT_SECRET)
        .then(decoded => {
        socket.user = { ...decoded };
        next();
    }).catch(err => {
        console.log('Bad request!');
        next(new Error('Not authorized'));
    });
};
exports.authorizeUser = authorizeUser;
const initializeUser = async (socket) => {
    // socket.user = {...socket.request.session.user};
    socket.join(socket.user.userid);
    await redis_1.default.hset(`userid:${socket.user.username}`, "userid", socket.user.userid, "connected", true);
    const friendList = await redis_1.default.lrange(`friends:${socket.user.username}`, 0, -1);
    const parsedFriendList = await parseFriendList(friendList);
    const friendRooms = parsedFriendList.map(friend => friend.userid);
    if (friendRooms.length > 0) {
        socket.to(friendRooms).emit('connected', true, socket.user.username);
    }
    socket.emit('friends', parsedFriendList);
    const msgQuery = await redis_1.default.lrange(`chat:${socket.user.userid}`, 0, -1);
    const messages = msgQuery.map(msgStr => {
        const parsedStr = msgStr.split('.');
        return { to: parsedStr[0], from: parsedStr[1], content: parsedStr[2] };
    });
    if (messages && messages.length > 0) {
        socket.emit('messages', messages);
    }
};
exports.initializeUser = initializeUser;
const addFriend = async (socket, friendName, cb) => {
    if (friendName === socket.user.username) {
        cb({ done: false, errorMsg: 'Cannot add self!' });
        return;
    }
    const friend = await redis_1.default.hgetall(`userid:${friendName}`);
    const currentFriendList = await redis_1.default.lrange(`friends:${socket.user.username}`, 0, -1);
    if (!friend.userid) {
        cb({ done: false, errorMsg: "User doesn't exist!" });
        return;
    }
    if (currentFriendList && currentFriendList.indexOf(friendName) !== -1) {
        cb({ done: false, errorMsg: "This user is already added!" });
        return;
    }
    await redis_1.default.lpush(`friends:${socket.user.username}`, [friendName, friend.userid].join('.'));
    const newFriend = {
        username: friendName,
        userid: friend.userid,
        connected: friend.connected
    };
    cb({ done: true, newFriend });
};
exports.addFriend = addFriend;
const onDisconnect = async (socket) => {
    await redis_1.default.hset(`userid:${socket.user.username}`, 'connected', false);
    const friendList = await redis_1.default.lrange(`friends:${socket.user.username}`, 0, -1);
    const friendRooms = await parseFriendList(friendList)
        .then(friends => friends.map(friend => friend.userid));
    socket.to(friendRooms).emit('connected', false, socket.user.username);
};
exports.onDisconnect = onDisconnect;
const parseFriendList = async (friendList) => {
    const newFriendList = [];
    for (let friend of friendList) {
        const parsedFriend = friend.split('.');
        const friendConnected = await redis_1.default.hget(`userid:${parsedFriend[0]}`, 'connected');
        newFriendList.push({ username: parsedFriend[0], userid: parsedFriend[1],
            connected: friendConnected });
    }
    return newFriendList;
};
