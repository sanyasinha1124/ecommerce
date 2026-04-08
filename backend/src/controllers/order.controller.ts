import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { OrderService } from '../services/order.service';

export const placeOrderValidation = [
  body('paymentMethod')
    .isIn(['credit_card', 'debit_card', 'cash_on_delivery', 'bank_transfer'])
    .withMessage('Invalid payment method'),
];

function handleError(err: any, res: Response, next: NextFunction) {
  if (err.status) {
    res.status(err.status).json({ message: err.message });
  } else {
    next(err);
  }
}

export class OrderController {

  // POST /api/orders
  static async placeOrder(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    try {
      const order = await OrderService.placeOrder(
        req.user!.userId,
        req.body.paymentMethod
      );
      // 201 Created — with full order detail for confirmation page
      res.status(201).json(order);
    } catch (err) { handleError(err, res, next); }
  }

  // GET /api/orders
  static async getOrders(req: Request, res: Response, next: NextFunction) {
    try {
      const orders = await OrderService.getOrders(req.user!.userId);
      res.json(orders);
    } catch (err) { handleError(err, res, next); }
  }

  // GET /api/orders/:id
  static async getOrderDetail(req: Request, res: Response, next: NextFunction) {
    try {
      const order = await OrderService.getOrderDetail(
        req.user!.userId,
        Number(req.params.id)
      );
      res.json(order);
    } catch (err) { handleError(err, res, next); }
  }
}