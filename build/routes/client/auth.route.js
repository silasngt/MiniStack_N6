"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const controller = require('../../controllers/client/auth.controller');
router.get('/login', controller.login);
router.get('/register', controller.register);
router.get('/profile/:id', controller.getProfile);
router.post('/login', controller.loginPost);
router.post('/register', controller.registerPost);
router.post('/logout', controller.logout);
router.put('/profile/:id', controller.updateProfile);
router.put('/change-password/:id', controller.changePassword);
exports.default = router;
