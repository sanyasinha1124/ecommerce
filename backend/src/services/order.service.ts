import { AppDataSource } from '../config/data-source';
import { Order, PaymentMethod } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { Product } from '../entities/Product';

export class OrderService {

  static async placeOrder(userId: number, paymentMethod: PaymentMethod) {

    // Validate payment method before touching the DB
    const validMethods: PaymentMethod[] = [
      'credit_card', 'debit_card', 'cash_on_delivery', 'bank_transfer'
    ];
    if (!validMethods.includes(paymentMethod)) {
      throw { status: 400, message: 'Invalid payment method' };
    }

    // Run entire checkout inside a transaction
    // If anything throws, all DB changes are rolled back automatically
    const order = await AppDataSource.transaction(async (manager) => {

      // Re-fetch cart with items inside the transaction
      const cart = await manager.findOne(Cart, {
        where: { user: { id: userId } },
        relations: { items: { product: true } },
      });

      if (!cart || cart.items.length === 0) {
        throw { status: 400, message: 'Your cart is empty' };
      }

      let totalAmount = 0;
      const orderItems: OrderItem[] = [];

      // Validate stock and build order items
      for (const cartItem of cart.items) {

        // Re-fetch product INSIDE transaction — guarantees current price and stock
        const product = await manager.findOneBy(Product, { id: cartItem.product.id });

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
        await manager.save(Product, product);

        // Build OrderItem with price snapshot — the critical line
        const orderItem = manager.create(OrderItem, {
          quantity: cartItem.quantity,
          priceAtPurchase: product.price,  // Copied NOW — never changes after this
          product,
        });

        orderItems.push(orderItem);
        totalAmount += product.price * cartItem.quantity;
      }

      // Create and save the Order
      const newOrder = manager.create(Order, {
        user: { id: userId },
        paymentMethod,
        totalAmount: Math.round(totalAmount * 100) / 100, // Round to 2 decimal places
        items: orderItems,
      });

      const savedOrder = await manager.save(Order, newOrder);

      // Clear the cart — inside the transaction so it rolls back if anything fails
      await manager.remove(CartItem, cart.items);

      return savedOrder;
    });

    // Return the full order with items for the confirmation page
    return OrderService.getOrderDetail(userId, order.id);
  }

  static async getOrders(userId: number) {
    const orderRepo = AppDataSource.getRepository(Order);

    return orderRepo.find({
      where: { user: { id: userId } },
      order: { placedAt: 'DESC' },       // Most recent first
      relations: { items: { product: true } },
    });
  }

  static async getOrderDetail(userId: number, orderId: number) {
    const orderRepo = AppDataSource.getRepository(Order);

    // The userId check here prevents IDOR — users can only see their own orders
    const order = await orderRepo.findOne({
      where: { id: orderId, user: { id: userId } },
      relations: { items: { product: true } },
    });

    if (!order) throw { status: 404, message: 'Order not found' };
    return order;
  }
}


