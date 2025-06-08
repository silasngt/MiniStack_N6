import express from 'express';
const router = express.Router();
const controller = require('../../controllers/client/auth.controller');
router.get('/login', controller.login);
router.get('/register', controller.register);
router.get('/profile/:id', controller.getProfile);
router.post('/login', controller.loginPost);
router.post('/register', controller.registerPost);
router.post('/logout', controller.logout);
router.put('/profile/:id', controller.updateProfile);
router.put('/change-password/:id', controller.changePassword);

export default router;
