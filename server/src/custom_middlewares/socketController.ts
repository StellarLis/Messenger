import { Socket } from "socket.io";
import redisClient from "../util/redis";
import { jwtVerify } from "../jwt/jwtAuth";\
import dotenv from 'dotenv';
dotenv.config();

export const authorizeUser = async (socket: Socket, next: Function) => {
    const token = socket.handshake.auth.token;
    jwtVerify(token, process.env.JWT_SECRET)
        .then(decoded => {
            socket.user = {...decoded};
            next();
        }).catch(err => {
            console.log('Bad request!');
            next(new Error('Not authorized'));
        });
}

export const initializeUser = async (socket: Socket) => {
    // socket.user = {...socket.request.session.user};
    
    socket.join(socket.user.userid);
    await redisClient.hset(
        `userid:${socket.user.username}`,
        "userid",
        socket.user.userid,
        "connected",
        true
    );
    const friendList = await redisClient.lrange(`friends:${socket.user.username}`, 0, -1);
    const parsedFriendList = await parseFriendList(friendList);
    const friendRooms = parsedFriendList.map(friend => friend.userid);
    if (friendRooms.length > 0) {
        socket.to(friendRooms).emit('connected', true, socket.user.username);
    }
    socket.emit('friends', parsedFriendList);

    const msgQuery = await redisClient.lrange(`chat:${socket.user.userid}`, 0, -1);
    const messages = msgQuery.map(msgStr => {
        const parsedStr = msgStr.split('.');
        return {to: parsedStr[0], from: parsedStr[1], content: parsedStr[2]};
    });
    if (messages && messages.length > 0) {
        socket.emit('messages', messages);
    }
}

export const addFriend = async (socket: Socket, friendName: string, cb: CallableFunction) => {
    if (friendName === socket.user.username) {
        cb({ done: false, errorMsg: 'Cannot add self!' });
        return;
    }
    const friend = await redisClient.hgetall(`userid:${friendName}`);
    const currentFriendList = await redisClient.lrange(
        `friends:${socket.user.username}`,
        0, -1
    );
    if (!friend.userid) {
        cb({ done: false, errorMsg: "User doesn't exist!" });
        return;
    }
    if (currentFriendList && currentFriendList.indexOf(friendName) !== -1) {
        cb({ done: false, errorMsg: "This user is already added!" });
        return;
    }

    await redisClient.lpush(
        `friends:${socket.user.username}`,
        [friendName, friend.userid].join('.')
    );
    const newFriend = {
        username: friendName,
        userid: friend.userid,
        connected: friend.connected
    };
    cb({ done: true, newFriend });
}

export const onDisconnect = async (socket: Socket) => {
    await redisClient.hset(
        `userid:${socket.user.username}`,
        'connected',
        false
    );
    const friendList = await redisClient.lrange(`friends:${socket.user.username}`, 0, -1);
    const friendRooms = await parseFriendList(friendList)
        .then(friends => friends.map(friend => friend.userid));
    socket.to(friendRooms).emit('connected', false, socket.user.username);
}

const parseFriendList = async (friendList: string[]) => {
    const newFriendList = [];
    for (let friend of friendList) {
        const parsedFriend = friend.split('.');
        const friendConnected = await redisClient.hget(`userid:${parsedFriend[0]}`, 'connected');
        newFriendList.push({ username: parsedFriend[0], userid: parsedFriend[1],
            connected: friendConnected });
    }
    return newFriendList;
}