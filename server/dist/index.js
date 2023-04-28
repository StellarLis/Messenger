"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const helmet_1 = __importDefault(require("helmet"));
const cors_1 = __importDefault(require("cors"));
const authRouter_1 = __importDefault(require("./routers/authRouter"));
const dotenv_1 = __importDefault(require("dotenv"));
const socketController_1 = require("./custom_middlewares/socketController");
const dm_1 = require("./util/dm");
// configuring
dotenv_1.default.config();
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        credentials: true
    }
});
// middlewares
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000',
    credentials: true
}));
// routes
app.use('/auth', authRouter_1.default);
// socket connection and listening
io.use(socketController_1.authorizeUser);
io.on('connect', (socket) => {
    (0, socketController_1.initializeUser)(socket);
    socket.on('add_friend', (friendName, cb) => {
        (0, socketController_1.addFriend)(socket, friendName, cb);
    });
    socket.on('dm', message => (0, dm_1.dm)(socket, message));
    socket.on('disconnect', () => (0, socketController_1.onDisconnect)(socket));
});
server.listen(4000, () => console.log('Listening on port 4000...'));
