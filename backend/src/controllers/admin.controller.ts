import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AdminService } from '../services/admin.service';

export const createProductValidation = [
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('description').trim().notEmpty().withMessage('Description is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('subCategoryId').isInt({ min: 1 }).withMessage('Valid subCategoryId required'),
];

function handleError(err: any, res: Response, next: NextFunction) {
  if (err.status) {
    res.status(err.status).json({ message: err.message });
  } else {
    next(err);
  }
}

export class AdminController {

  // ─── Products ─────────────────────────────────────────────────────────────

  static async listProducts(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await AdminService.listProducts());
    } catch (err) { handleError(err, res, next); }
  }

  static async createProduct(req: Request, res: Response, next: NextFunction) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(422).json({ errors: errors.array() });
      return;
    }
    try {
      // req.file is populated by Multer if an image was uploaded
      const imagePath = req.file ? req.file.filename : undefined;
      const product = await AdminService.createProduct(req.body, imagePath);
      res.status(201).json(product);
    } catch (err) { handleError(err, res, next); }
  }

  static async updateProduct(req: Request, res: Response, next: NextFunction) {
    try {
      const imagePath = req.file ? req.file.filename : undefined;
      const product = await AdminService.updateProduct(
        Number(req.params.id),
        req.body,
        imagePath
      );
      res.json(product);
    } catch (err) { handleError(err, res, next); }
  }

  static async deleteProduct(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await AdminService.deleteProduct(Number(req.params.id)));
    } catch (err) { handleError(err, res, next); }
  }

  // ─── Customers ────────────────────────────────────────────────────────────

  static async listCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await AdminService.listCustomers());
    } catch (err) { handleError(err, res, next); }
  }

  static async toggleLock(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await AdminService.toggleLock(Number(req.params.id)));
    } catch (err) { handleError(err, res, next); }
  }

  // ─── Orders ───────────────────────────────────────────────────────────────

  static async listOrders(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await AdminService.listAllOrders());
    } catch (err) { handleError(err, res, next); }
  }

  static async getOrderDetail(req: Request, res: Response, next: NextFunction) {
    try {
      res.json(await AdminService.getOrderDetail(Number(req.params.id)));
    } catch (err) { handleError(err, res, next); }
  }
}