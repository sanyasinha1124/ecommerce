"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CartService = void 0;
const data_source_1 = require("../config/data-source");
const Cart_1 = require("../entities/Cart");
const CartItem_1 = require("../entities/CartItem");
const Product_1 = require("../entities/Product");
const cartRepo = () => data_source_1.AppDataSource.getRepository(Cart_1.Cart);
const cartItemRepo = () => data_source_1.AppDataSource.getRepository(CartItem_1.CartItem);
const productRepo = () => data_source_1.AppDataSource.getRepository(Product_1.Product);
class CartService {
    // Always returns the user's cart with all items loaded
    // Creates the cart if it somehow doesn't exist (defensive)
    static async getOrCreateCart(userId) {
        let cart = await cartRepo().findOne({
            where: { user: { id: userId } },
            relations: {
                items: {
                    product: {
                        subCategory: {
                            category: {
                                type: true,
                            },
                        },
                    },
                },
            },
        });
        if (!cart) {
            const user = { id: userId };
            cart = cartRepo().create({ user });
            await cartRepo().save(cart);
            cart.items = [];
        }
        return cart;
    }
    static async getCart(userId) {
        const cart = await CartService.getOrCreateCart(userId);
        // Calculate totals server-side — never trust client calculations
        const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
        return { ...cart, subtotal };
    }
    static async addItem(userId, productId, quantity) {
        // Validate quantity
        if (quantity < 1)
            throw { status: 400, message: 'Quantity must be at least 1' };
        // Fetch and validate product — never trust client-provided data
        const product = await productRepo().findOneBy({ id: productId, isActive: true });
        if (!product)
            throw { status: 404, message: 'Product not found' };
        if (product.stock < quantity) {
            throw { status: 400, message: `Only ${product.stock} units available` };
        }
        const cart = await CartService.getOrCreateCart(userId);
        // Upsert: check if this product is already in the cart
        const existingItem = await cartItemRepo().findOne({
            where: {
                cart: { id: cart.id },
                product: { id: productId },
            },
        });
        if (existingItem) {
            // Product already in cart — increment quantity
            const newQuantity = existingItem.quantity + quantity;
            // Check combined quantity doesn't exceed stock
            if (product.stock < newQuantity) {
                throw { status: 400, message: `Cannot add ${quantity} more. Only ${product.stock - existingItem.quantity} additional units available` };
            }
            existingItem.quantity = newQuantity;
            await cartItemRepo().save(existingItem);
        }
        else {
            // New item — create CartItem row
            const item = cartItemRepo().create({ cart, product, quantity });
            await cartItemRepo().save(item);
        }
        // Return updated cart
        return CartService.getCart(userId);
    }
    static async updateQuantity(userId, itemId, quantity) {
        if (quantity < 1)
            throw { status: 400, message: 'Quantity must be at least 1' };
        // Find item and confirm it belongs to this user's cart — prevents IDOR
        const item = await cartItemRepo().findOne({
            where: { id: itemId },
            relations: { cart: { user: true }, product: true },
        });
        if (!item)
            throw { status: 404, message: 'Cart item not found' };
        // Authorization check — user can only update their own cart items
        if (item.cart.user.id !== userId) {
            throw { status: 403, message: 'Forbidden' };
        }
        if (item.product.stock < quantity) {
            throw { status: 400, message: `Only ${item.product.stock} units available` };
        }
        item.quantity = quantity;
        await cartItemRepo().save(item);
        return CartService.getCart(userId);
    }
    static async removeItem(userId, itemId) {
        const item = await cartItemRepo().findOne({
            where: { id: itemId },
            relations: { cart: { user: true } },
        });
        if (!item)
            throw { status: 404, message: 'Cart item not found' };
        // Authorization check — prevent IDOR (Insecure Direct Object Reference)
        if (item.cart.user.id !== userId) {
            throw { status: 403, message: 'Forbidden' };
        }
        await cartItemRepo().remove(item);
        return CartService.getCart(userId);
    }
    // Called internally by OrderService after successful checkout
    static async clearCart(userId) {
        const cart = await cartRepo().findOne({
            where: { user: { id: userId } },
            relations: { items: true },
        });
        if (cart && cart.items.length > 0) {
            await cartItemRepo().remove(cart.items);
        }
    }
}
exports.CartService = CartService;
