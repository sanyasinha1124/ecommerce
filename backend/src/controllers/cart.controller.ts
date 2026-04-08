import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { CartService } from '../services/cart.service';

export const addItemValidation = [
  body('productId').isInt({ min: 1 }).withMessage('Valid product ID required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

export const updateQuantityValidation = [
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

function handleError(err: any, res: Response, next: NextFunction) {
  if (err.status) {
    res.status(err.status).json({ message: err.message });
  } else {
    next(err);
  }
}

export class CartController {

  static async getCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.getCart(req.user!.userId);
      res.json(cart);
    } catch (err) { handleError(err, res, next); }
  }

  static async addItem(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    try {
      const { productId, quantity } = req.body;
      const cart = await CartService.addItem(req.user!.userId, productId, quantity);
      res.json(cart);
    } catch (err) { handleError(err, res, next); }
  }

  static async updateQuantity(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    try {
      const cart = await CartService.updateQuantity(
        req.user!.userId,
        Number(req.params.itemId),
        req.body.quantity
      );
      res.json(cart);
    } catch (err) { handleError(err, res, next); }
  }

  static async removeItem(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await CartService.removeItem(
        req.user!.userId,
        Number(req.params.itemId)
      );
      res.json(cart);
    } catch (err) { handleError(err, res, next); }
  }
}