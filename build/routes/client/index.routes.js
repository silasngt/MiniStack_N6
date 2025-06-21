"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.routesClient = void 0;
const miniStack_route_1 = require("./miniStack.route");
const forum_route_1 = require("./forum.route");
const blog_route_1 = require("./blog.route");
const auth_route_1 = __importDefault(require("./auth.route"));
const Document_route_1 = require("./Document.route");
const Profile_route_1 = require("./Profile.route");
const chatBox_route_1 = require("./chatBox.route");
const compile_route_1 = require("./compile.route");
const search_routes_1 = require("./search.routes");
const contact_route_1 = __importDefault(require("./contact.route"));
const routesClient = (app) => {
    app.use('/', miniStack_route_1.miniStackRoute);
    app.use('/forum', forum_route_1.forumRoute);
    app.use('/blog', blog_route_1.blogRoute);
    app.use('/auth', auth_route_1.default);
    app.use('/profile', Profile_route_1.profileRoute);
    app.use('/chatBox', chatBox_route_1.chatBoxRoute);
    app.use('/compile', compile_route_1.compileRoute);
    app.use('/search', search_routes_1.searchRoute);
    app.use('/document', Document_route_1.documentRoute);
    app.use('/contact', contact_route_1.default);
    app.use((req, res) => {
        res.status(404).render('client/pages/errors/404', {
            pageTitle: '404 Not Found',
        });
    });
};
exports.routesClient = routesClient;
