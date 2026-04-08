import { AppDataSource } from '../config/data-source';
import { Product } from '../entities/Product';
import { Type } from '../entities/Type';

const productRepo = () => AppDataSource.getRepository(Product);
const typeRepo = () => AppDataSource.getRepository(Type);

// Shape of query params coming from the controller
export interface ProductQuery {
  keyword?: string;
  typeId?: number;
  categoryId?: number;
  subCategoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  page?: number;
  limit?: number;
}

export class ProductService {

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
  static async findProducts(query: ProductQuery) {
    const {
      keyword,
      typeId,
      categoryId,
      subCategoryId,
      minPrice,
      maxPrice,
      inStockOnly,
      page = 1,
      limit = 12,
    } = query;

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
      qb.andWhere(
        '(p.name LIKE :kw OR p.description LIKE :kw)',
        { kw: `%${keyword}%` }
      );
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

  static async getOne(id: number) {
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

    if (!product) throw { status: 404, message: 'Product not found' };
    return product;
  }
}