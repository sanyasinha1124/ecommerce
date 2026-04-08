import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';

export class ProductController {

  // GET /api/products?page=1&limit=12&typeId=1&minPrice=100&maxPrice=5000
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.findProducts(parseQuery(req));
      res.json(result);
    } catch (err) { next(err); }
  }

  // GET /api/products/search?keyword=table&categoryId=2&page=1
  // Same service method — keyword is just another filter
  static async search(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.findProducts(parseQuery(req));
      res.json(result);
    } catch (err) { next(err); }
  }

  // GET /api/products/taxonomy
  static async getTaxonomy(req: Request, res: Response, next: NextFunction) {
    try {
      const taxonomy = await ProductService.getTaxonomy();
      res.json(taxonomy);
    } catch (err) { next(err); }
  }

  // GET /api/products/:id
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await ProductService.getOne(Number(req.params.id));
      res.json(product);
    } catch (err: any) {
      if (err.status) {
        res.status(err.status).json({ message: err.message });
      } else {
        next(err);
      }
    }
  }
}

// Parses and coerces query string values to the correct types
// Query strings are always strings — we must convert explicitly
function parseQuery(req: Request) {
  const q = req.query;
  return {
    keyword:       q.keyword       ? String(q.keyword)        : undefined,
    typeId:        q.typeId        ? Number(q.typeId)         : undefined,
    categoryId:    q.categoryId    ? Number(q.categoryId)     : undefined,
    subCategoryId: q.subCategoryId ? Number(q.subCategoryId)  : undefined,
    minPrice:      q.minPrice      ? Number(q.minPrice)       : undefined,
    maxPrice:      q.maxPrice      ? Number(q.maxPrice)       : undefined,
    inStockOnly:   q.inStockOnly === 'true',
    page:          q.page          ? Number(q.page)           : 1,
    limit:         q.limit         ? Number(q.limit)          : 12,
  };
}