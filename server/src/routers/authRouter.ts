import express from 'express';
import authController from '../controllers/authController';
import validateForm from '../custom_middlewares/validateForm';
import rateLimiter from '../custom_middlewares/rateLimiter';

const router = express.Router();

router.post('/login', validateForm, rateLimiter(60, 10), authController.login);
router.get('/login', authController.checkIfLoggedIn);
router.post('/signup', validateForm, rateLimiter(30, 4), authController.signUp);

export default router;