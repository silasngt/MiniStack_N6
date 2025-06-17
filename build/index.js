"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_middleware_1 = require("./middlewares/client/auth.middleware");
const database_1 = __importDefault(require("./config/database"));
const index_routes_1 = require("./routes/client/index.routes");
const index_routes_2 = require("./routes/admin/index.routes");
const system_1 = require("./config/system");
const express_session_1 = __importDefault(require("express-session"));
const method_override_1 = __importDefault(require("method-override"));
const express_flash_1 = __importDefault(require("express-flash"));
database_1.default;
const app = (0, express_1.default)();
const port = 3000;
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.static(`${__dirname}/public`));
app.set('views', `${__dirname}/views`);
app.set('view engine', 'pug');
app.use((0, method_override_1.default)('_method'));
app.locals.prefixAdmin = system_1.systemConfig.prefixAdmin;
app.use((0, express_session_1.default)({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: false,
}));
app.use((0, express_flash_1.default)());
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cookie_parser_1.default)());
app.use(auth_middleware_1.checkAuth);
app.use(auth_middleware_1.addUserToViews);
(0, index_routes_1.routesClient)(app);
(0, index_routes_2.routesAdmin)(app);
app.listen(port, () => {
    console.log(`App listening on port http://localhost:${port}`);
});
