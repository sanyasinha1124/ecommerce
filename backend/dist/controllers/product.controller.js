"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductController = void 0;
const product_service_1 = require("../services/product.service");
class ProductController {
    // GET /api/products?page=1&limit=12&typeId=1&minPrice=100&maxPrice=5000
    static async list(req, res, next) {
        try {
            const result = await product_service_1.ProductService.findProducts(parseQuery(req));
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    // GET /api/products/search?keyword=table&categoryId=2&page=1
    // Same service method — keyword is just another filter
    static async search(req, res, next) {
        try {
            const result = await product_service_1.ProductService.findProducts(parseQuery(req));
            res.json(result);
        }
        catch (err) {
            next(err);
        }
    }
    // GET /api/products/taxonomy
    static async getTaxonomy(req, res, next) {
        try {
            const taxonomy = await product_service_1.ProductService.getTaxonomy();
            res.json(taxonomy);
        }
        catch (err) {
            next(err);
        }
    }
    // GET /api/products/:id
    static async getOne(req, res, next) {
        try {
            const product = await product_service_1.ProductService.getOne(Number(req.params.id));
            res.json(product);
        }
        catch (err) {
            if (err.status) {
                res.status(err.status).json({ message: err.message });
            }
            else {
                next(err);
            }
        }
    }
}
exports.ProductController = ProductController;
// Parses and coerces query string values to the correct types
// Query strings are always strings — we must convert explicitly
function parseQuery(req) {
    const q = req.query;
    return {
        keyword: q.keyword ? String(q.keyword) : undefined,
        typeId: q.typeId ? Number(q.typeId) : undefined,
        categoryId: q.categoryId ? Number(q.categoryId) : undefined,
        subCategoryId: q.subCategoryId ? Number(q.subCategoryId) : undefined,
        minPrice: q.minPrice ? Number(q.minPrice) : undefined,
        maxPrice: q.maxPrice ? Number(q.maxPrice) : undefined,
        inStockOnly: q.inStockOnly === 'true',
        page: q.page ? Number(q.page) : 1,
        limit: q.limit ? Number(q.limit) : 12,
    };
}
