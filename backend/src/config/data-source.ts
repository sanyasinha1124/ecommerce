import 'reflect-metadata';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { ProductType } from '../entities/ProductType';
import { Category } from '../entities/Category';
import { SubCategory } from '../entities/SubCategory';
import { Product } from '../entities/Product';
import { Cart } from '../entities/Cart';
import { CartItem } from '../entities/CartItem';
import { Order } from '../entities/Order';
import { OrderItem } from '../entities/OrderItem';

dotenv.config();

export const AppDataSource = new DataSource({
  // type: 'better-sqlite3',
  // database: 'ecommerce.db',       // File created in backend/ root
  // synchronize: false,               // Auto-creates tables from entities — fine for dev
  // logging: false,
  // entities: [User, Type, Category, SubCategory, Product, Cart, CartItem, Order, OrderItem],
  // migrations: ['src/migrations/*.ts'],
  
  type: process.env.DB_TYPE as any,
  database: process.env.DB_NAME,
  synchronize: false, // disable auto-sync, use migrations
  logging: process.env.DB_LOGGING === 'true' || true,
  entities: [
    User,
    ProductType,
    Category,
    SubCategory,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
  ],
  // migrations: [process.env.DB_MIGRATIONS as string],
  // migrations: ['src/migrations/**/*.ts'],
  // This detects the file extension automatically based on the environment
  migrations: [
    process.env.NODE_ENV === 'production' 
      ? 'dist/migrations/**/*.js' 
      : 'src/migrations/**/*.ts'
  ],
});