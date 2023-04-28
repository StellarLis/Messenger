"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = __importDefault(require("../controllers/authController"));
const validateForm_1 = __importDefault(require("../custom_middlewares/validateForm"));
const rateLimiter_1 = __importDefault(require("../custom_middlewares/rateLimiter"));
const router = express_1.default.Router();
router.post('/login', validateForm_1.default, (0, rateLimiter_1.default)(60, 10), authController_1.default.login);
router.get('/login', authController_1.default.checkIfLoggedIn);
router.post('/signup', validateForm_1.default, (0, rateLimiter_1.default)(30, 4), authController_1.default.signUp);
exports.default = router;
