"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
const dotenv = __importStar(require("dotenv"));
const typeorm_1 = require("typeorm");
const User_1 = require("../entities/User");
const ProductType_1 = require("../entities/ProductType");
const Category_1 = require("../entities/Category");
const SubCategory_1 = require("../entities/SubCategory");
const Product_1 = require("../entities/Product");
const Cart_1 = require("../entities/Cart");
const CartItem_1 = require("../entities/CartItem");
const Order_1 = require("../entities/Order");
const OrderItem_1 = require("../entities/OrderItem");
dotenv.config();
exports.AppDataSource = new typeorm_1.DataSource({
    // type: 'better-sqlite3',
    // database: 'ecommerce.db',       // File created in backend/ root
    // synchronize: false,               // Auto-creates tables from entities — fine for dev
    // logging: false,
    // entities: [User, Type, Category, SubCategory, Product, Cart, CartItem, Order, OrderItem],
    // migrations: ['src/migrations/*.ts'],
    type: process.env.DB_TYPE,
    database: process.env.DB_NAME,
    synchronize: false, // disable auto-sync, use migrations
    logging: process.env.DB_LOGGING === 'true' || true,
    entities: [
        User_1.User,
        ProductType_1.ProductType,
        Category_1.Category,
        SubCategory_1.SubCategory,
        Product_1.Product,
        Cart_1.Cart,
        CartItem_1.CartItem,
        Order_1.Order,
        OrderItem_1.OrderItem,
    ],
    // migrations: [process.env.DB_MIGRATIONS as string],
    // migrations: ['src/migrations/**/*.ts'],
    // This detects the file extension automatically based on the environment
    migrations: [
        process.env.NODE_ENV === 'production'
            ? 'dist/migrations/**/*.js'
            : 'src/migrations/**/*.ts'
    ],
});
