import { AppDataSource } from '../config/data-source';
import { Product } from '../entities/Product';
import { User } from '../entities/User';
import { Order } from '../entities/Order';
import { SubCategory } from '../entities/SubCategory';
import { SessionStore } from '../session/store';
import fs from 'fs';
import path from 'path';

const productRepo = () => AppDataSource.getRepository(Product);
const userRepo = () => AppDataSource.getRepository(User);
const orderRepo = () => AppDataSource.getRepository(Order);
const subCatRepo = () => AppDataSource.getRepository(SubCategory);

export class AdminService {

  // ─── Products ────────────────────────────────────────────────────────────

  static async listProducts() {
    return productRepo().find({
      where: { isActive: true },
      relations: {
        subCategory: {
          category: { type: true },
        },
      },
      order: { name: 'ASC' },
    });
  }

 // admin.service.ts (Backend)
static async createProduct(body: any, imagePath?: string) {
  // CONVERT TO NUMBER HERE
  const subCatId = Number(body.subCategoryId);

  const subCategory = await subCatRepo().findOne({
    where: { id: subCatId }, // Use the converted number
    relations: { category: { type: true } },
  });

  if (!subCategory) throw { status: 404, message: 'SubCategory not found' };
  


    const product = productRepo().create({
      name: body.name,
      description: body.description,
      price: Number(body.price),
      stock: Number(body.stock),
      subCategory,
      imagePath: imagePath ?? null,
    });

    return productRepo().save(product);
  }

static async updateProduct(
  id: number,
  body: any, // Use any or a specific interface
  newImagePath?: string
) {
  const product = await productRepo().findOne({
    where: { id, isActive: true },
    relations: { subCategory: true },
  });

  if (!product) throw { status: 404, message: 'Product not found' };

  // Update scalar fields with explicit Number conversion
  if (body.name !== undefined)        product.name = body.name;
  if (body.description !== undefined) product.description = body.description;
  if (body.price !== undefined)       product.price = Number(body.price);
  if (body.stock !== undefined)       product.stock = Number(body.stock);

  // FIX HERE: Ensure subCategoryId is a Number before querying
  if (body.subCategoryId !== undefined && body.subCategoryId !== null) {
    const subCatId = Number(body.subCategoryId); // Ensure it's a number
    const subCategory = await subCatRepo().findOneBy({ id: subCatId });
    
    if (!subCategory) throw { status: 404, message: 'SubCategory not found' };
    product.subCategory = subCategory;
  }

  // Image deletion logic remains correct
  if (newImagePath !== undefined) {
    if (product.imagePath) {
      const oldPath = path.join(__dirname, '../../../ProductImages', product.imagePath);
      if (fs.existsSync(oldPath)) {
          try { fs.unlinkSync(oldPath); } catch(e) { console.error("Old image delete failed", e); }
      }
    }
    product.imagePath = newImagePath;
  }

  return productRepo().save(product);
}
  static async deleteProduct(id: number) {
    const product = await productRepo().findOneBy({ id, isActive: true });
    if (!product) throw { status: 404, message: 'Product not found' };

    // Soft delete — preserves OrderItem foreign key references
    // Hard delete would break order history for any customer who bought this item
    product.isActive = false;
    await productRepo().save(product);

    return { message: 'Product deleted successfully' };
  }

  // ─── Customers ────────────────────────────────────────────────────────────

  static async listCustomers() {
    return userRepo().find({
      where: { role: 'customer' },
      select: ['id', 'name', 'email', 'isLocked'],
      order: { name: 'ASC' },
    });
  }

  static async toggleLock(customerId: number) {
    const user = await userRepo().findOne({
      where: { id: customerId, role: 'customer' },
    });

    if (!user) throw { status: 404, message: 'Customer not found' };

    user.isLocked = !user.isLocked;
    await userRepo().save(user);

    // If locking — immediately invalidate ALL active sessions for this user
    // This is the mechanism that makes the lock take effect on the very next request
    if (user.isLocked) {
      SessionStore.deleteByUserId(customerId);
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      isLocked: user.isLocked,
      message: user.isLocked ? 'Account locked' : 'Account unlocked',
    };
  }

  // ─── Orders ──────────────────────────────────────────────────────────────

  static async listAllOrders() {
    return orderRepo().find({
      relations: { user: true, items: { product: true } },
      order: { placedAt: 'DESC' },
    });
  }

  static async getOrderDetail(orderId: number) {
    const order = await orderRepo().findOne({
      where: { id: orderId },
      relations: { user: true, items: { product: true } },
    });

    if (!order) throw { status: 404, message: 'Order not found' };
    return order;
  }
}