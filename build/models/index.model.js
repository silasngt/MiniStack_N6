"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForumTopic = exports.User = void 0;
const user_model_1 = __importDefault(require("./user.model"));
exports.User = user_model_1.default;
const forum_topic_model_1 = __importDefault(require("./forum-topic.model"));
exports.ForumTopic = forum_topic_model_1.default;
user_model_1.default.hasMany(forum_topic_model_1.default, { foreignKey: 'AuthorID' });
forum_topic_model_1.default.belongsTo(user_model_1.default, { foreignKey: 'AuthorID' });
