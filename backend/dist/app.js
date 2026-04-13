"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const product_routes_1 = __importDefault(require("./routes/product.routes"));
const cart_routes_1 = __importDefault(require("./routes/cart.routes"));
const order_routes_1 = __importDefault(require("./routes/order.routes"));
const admin_routes_1 = __importDefault(require("./routes/admin.routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const app = (0, express_1.default)();
// Security middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: 'http://localhost:4200', // Angular dev server
    credentials: true, // Required for cookies to be sent cross-origin
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// Static file serving
app.use('/ProductImages', express_1.default.static(path_1.default.join(__dirname, '../../ProductImages')));
// API routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/products', product_routes_1.default);
app.use('/api/cart', cart_routes_1.default);
app.use('/api/orders', order_routes_1.default);
app.use('/api/admin', admin_routes_1.default);
// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
// SPA fallback — must be last; serves Angular's index.html for all non-API routes
const frontendDist = path_1.default.join(__dirname, '../../frontend/dist/frontend/browser');
app.use(express_1.default.static(frontendDist));
app.get('/api', (req, res) => {
    res.sendFile(path_1.default.join(frontendDist, 'index.html'));
});
// Central error handler — must be registered after all routes
app.use(errorHandler_1.errorHandler);
exports.default = app;
