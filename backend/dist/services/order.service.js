"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const data_source_1 = require("../config/data-source");
const Order_1 = require("../entities/Order");
const OrderItem_1 = require("../entities/OrderItem");
const Cart_1 = require("../entities/Cart");
const CartItem_1 = require("../entities/CartItem");
const Product_1 = require("../entities/Product");
class OrderService {
    static async placeOrder(userId, paymentMethod) {
        // Validate payment method before touching the DB
        const validMethods = [
            'credit_card', 'debit_card', 'cash_on_delivery', 'bank_transfer'
        ];
        if (!validMethods.includes(paymentMethod)) {
            throw { status: 400, message: 'Invalid payment method' };
        }
        // Run entire checkout inside a transaction
        // If anything throws, all DB changes are rolled back automatically
        const order = await data_source_1.AppDataSource.transaction(async (manager) => {
            // Re-fetch cart with items inside the transaction
            const cart = await manager.findOne(Cart_1.Cart, {
                where: { user: { id: userId } },
                relations: { items: { product: true } },
            });
            if (!cart || cart.items.length === 0) {
                throw { status: 400, message: 'Your cart is empty' };
            }
            let totalAmount = 0;
            const orderItems = [];
            // Validate stock and build order items
            for (const cartItem of cart.items) {
                // Re-fetch product INSIDE transaction — guarantees current price and stock
                const product = await manager.findOneBy(Product_1.Product, { id: cartItem.product.id });
                if (!product || !product.isActive) {
                    throw { status: 400, message: `"${cartItem.product.name}" is no longer available` };
                }
                if (product.stock < cartItem.quantity) {
                    throw {
                        status: 400,
                        message: `Insufficient stock for "${product.name}". Available: ${product.stock}`
                    };
                }
                // Deduct stock
                product.stock -= cartItem.quantity;
                await manager.save(Product_1.Product, product);
                // Build OrderItem with price snapshot — the critical line
                const orderItem = manager.create(OrderItem_1.OrderItem, {
                    quantity: cartItem.quantity,
                    priceAtPurchase: product.price, // Copied NOW — never changes after this
                    product,
                });
                orderItems.push(orderItem);
                totalAmount += product.price * cartItem.quantity;
            }
            // Create and save the Order
            const newOrder = manager.create(Order_1.Order, {
                user: { id: userId },
                paymentMethod,
                totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
                items: orderItems,
            });
            const savedOrder = await manager.save(Order_1.Order, newOrder);
            // Clear the cart — inside the transaction so it rolls back if anything fails
            await manager.remove(CartItem_1.CartItem, cart.items);
            return savedOrder;
        });
        // Return the full order with items for the confirmation page
        return OrderService.getOrderDetail(userId, order.id);
    }
    static async getOrders(userId) {
        const orderRepo = data_source_1.AppDataSource.getRepository(Order_1.Order);
        return orderRepo.find({
            where: { user: { id: userId } },
            order: { placedAt: 'DESC' }, // Most recent first
            relations: { items: { product: true } },
        });
    }
    static async getOrderDetail(userId, orderId) {
        const orderRepo = data_source_1.AppDataSource.getRepository(Order_1.Order);
        // The userId check here prevents IDOR — users can only see their own orders
        const order = await orderRepo.findOne({
            where: { id: orderId, user: { id: userId } },
            relations: { items: { product: true } },
        });
        if (!order)
            throw { status: 404, message: 'Order not found' };
        return order;
    }
}
exports.OrderService = OrderService;
