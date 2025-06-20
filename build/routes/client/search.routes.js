"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoute = void 0;
const express_1 = require("express");
const search_controller_1 = __importDefault(require("../../controllers/client/search.controller"));
const router = (0, express_1.Router)();
router.get('/', search_controller_1.default.search);
router.get('/suggestions', search_controller_1.default.searchSuggestions);
exports.searchRoute = router;
