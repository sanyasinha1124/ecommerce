"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const data_source_1 = require("../config/data-source");
const Product_1 = require("../entities/Product");
const User_1 = require("../entities/User");
const Order_1 = require("../entities/Order");
const SubCategory_1 = require("../entities/SubCategory");
const store_1 = require("../session/store");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const productRepo = () => data_source_1.AppDataSource.getRepository(Product_1.Product);
const userRepo = () => data_source_1.AppDataSource.getRepository(User_1.User);
const orderRepo = () => data_source_1.AppDataSource.getRepository(Order_1.Order);
const subCatRepo = () => data_source_1.AppDataSource.getRepository(SubCategory_1.SubCategory);
class AdminService {
    // ─── Products ────────────────────────────────────────────────────────────
    static async listProducts() {
        return productRepo().find({
            where: { isActive: true },
            relations: {
                subCategory: {
                    category: { type: true },
                },
            },
            order: { name: 'ASC' },
        });
    }
    static async createProduct(body, imagePath) {
        const subCategory = await subCatRepo().findOne({
            where: { id: body.subCategoryId },
            relations: { category: { type: true } },
        });
        if (!subCategory)
            throw { status: 404, message: 'SubCategory not found' };
        const product = productRepo().create({
            name: body.name,
            description: body.description,
            price: Number(body.price),
            stock: Number(body.stock),
            subCategory,
            imagePath: imagePath ?? null,
        });
        return productRepo().save(product);
    }
    static async updateProduct(id, body, newImagePath) {
        const product = await productRepo().findOne({
            where: { id, isActive: true },
            relations: { subCategory: true },
        });
        if (!product)
            throw { status: 404, message: 'Product not found' };
        // Update scalar fields if provided
        if (body.name !== undefined)
            product.name = body.name;
        if (body.description !== undefined)
            product.description = body.description;
        if (body.price !== undefined)
            product.price = Number(body.price);
        if (body.stock !== undefined)
            product.stock = Number(body.stock);
        // Update taxonomy placement if subCategoryId provided
        if (body.subCategoryId !== undefined) {
            const subCategory = await subCatRepo().findOneBy({ id: body.subCategoryId });
            if (!subCategory)
                throw { status: 404, message: 'SubCategory not found' };
            product.subCategory = subCategory;
        }
        // Replace image — delete old file from disk to avoid orphaned files
        if (newImagePath !== undefined) {
            if (product.imagePath) {
                const oldPath = path_1.default.join(__dirname, '../../../ProductImages', product.imagePath);
                if (fs_1.default.existsSync(oldPath))
                    fs_1.default.unlinkSync(oldPath);
            }
            product.imagePath = newImagePath;
        }
        return productRepo().save(product);
    }
    static async deleteProduct(id) {
        const product = await productRepo().findOneBy({ id, isActive: true });
        if (!product)
            throw { status: 404, message: 'Product not found' };
        // Soft delete — preserves OrderItem foreign key references
        // Hard delete would break order history for any customer who bought this item
        product.isActive = false;
        await productRepo().save(product);
        return { message: 'Product deleted successfully' };
    }
    // ─── Customers ────────────────────────────────────────────────────────────
    static async listCustomers() {
        return userRepo().find({
            where: { role: 'customer' },
            select: ['id', 'name', 'email', 'isLocked'],
            order: { name: 'ASC' },
        });
    }
    static async toggleLock(customerId) {
        const user = await userRepo().findOne({
            where: { id: customerId, role: 'customer' },
        });
        if (!user)
            throw { status: 404, message: 'Customer not found' };
        user.isLocked = !user.isLocked;
        await userRepo().save(user);
        // If locking — immediately invalidate ALL active sessions for this user
        // This is the mechanism that makes the lock take effect on the very next request
        if (user.isLocked) {
            store_1.SessionStore.deleteByUserId(customerId);
        }
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            isLocked: user.isLocked,
            message: user.isLocked ? 'Account locked' : 'Account unlocked',
        };
    }
    // ─── Orders ──────────────────────────────────────────────────────────────
    static async listAllOrders() {
        return orderRepo().find({
            relations: { user: true, items: { product: true } },
            order: { placedAt: 'DESC' },
        });
    }
    static async getOrderDetail(orderId) {
        const order = await orderRepo().findOne({
            where: { id: orderId },
            relations: { user: true, items: { product: true } },
        });
        if (!order)
            throw { status: 404, message: 'Order not found' };
        return order;
    }
}
exports.AdminService = AdminService;
