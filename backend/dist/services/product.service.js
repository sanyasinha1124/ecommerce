"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductService = void 0;
const data_source_1 = require("../config/data-source");
const Product_1 = require("../entities/Product");
const ProductType_1 = require("../entities/ProductType");
const productRepo = () => data_source_1.AppDataSource.getRepository(Product_1.Product);
const typeRepo = () => data_source_1.AppDataSource.getRepository(ProductType_1.ProductType);
class ProductService {
    // Full taxonomy tree — used to build nav menus in Angular
    static async getTaxonomy() {
        return typeRepo().find({
            relations: {
                categories: {
                    subCategories: true,
                },
            },
            order: { name: 'ASC' },
        });
    }
    // Core method — powers both /products and /products/search
    // All filtering and pagination happens here in one QueryBuilder
    static async findProducts(query) {
        const { keyword, typeId, categoryId, subCategoryId, minPrice, maxPrice, inStockOnly, page = 1, limit = 12, } = query;
        const qb = productRepo()
            .createQueryBuilder('p')
            // Join the full taxonomy chain — required for filtering by type/category
            .leftJoinAndSelect('p.subCategory', 'sub')
            .leftJoinAndSelect('sub.category', 'cat')
            .leftJoinAndSelect('cat.type', 'type')
            // Only show active (non-soft-deleted) products
            .where('p.isActive = :active', { active: true });
        // Full-text search — checks both name AND description
        // This is what makes the "table" example work across taxonomy boundaries
        if (keyword) {
            qb.andWhere('(p.name LIKE :kw OR p.description LIKE :kw)', { kw: `%${keyword}%` });
        }
        // Taxonomy filters — each is independent and composable
        if (typeId) {
            qb.andWhere('type.id = :typeId', { typeId });
        }
        if (categoryId) {
            qb.andWhere('cat.id = :categoryId', { categoryId });
        }
        if (subCategoryId) {
            qb.andWhere('sub.id = :subCategoryId', { subCategoryId });
        }
        // Price range filters
        if (minPrice !== undefined) {
            qb.andWhere('p.price >= :minPrice', { minPrice });
        }
        if (maxPrice !== undefined) {
            qb.andWhere('p.price <= :maxPrice', { maxPrice });
        }
        // Optional extra filter — in-stock only
        if (inStockOnly) {
            qb.andWhere('p.stock > 0');
        }
        // Pagination — offset calculated from page number
        const offset = (page - 1) * limit;
        qb.skip(offset).take(limit).orderBy('p.name', 'ASC');
        // getManyAndCount = data rows + total in one DB round trip
        const [products, total] = await qb.getManyAndCount();
        return {
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    static async getOne(id) {
        const product = await productRepo().findOne({
            where: { id, isActive: true },
            relations: {
                subCategory: {
                    category: {
                        type: true,
                    },
                },
            },
        });
        if (!product)
            throw { status: 404, message: 'Product not found' };
        return product;
    }
}
exports.ProductService = ProductService;
