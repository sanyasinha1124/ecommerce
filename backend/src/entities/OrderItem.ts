import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Order } from './Order';
import { Product } from './Product';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: 1 })
  quantity: number;

  // THE critical column — price copied from Product at checkout time
  @Column('decimal', { precision: 10, scale: 2 })
  priceAtPurchase: number;

  @ManyToOne(() => Order, order => order.items, { onDelete: 'CASCADE' })
  order: Order;

  // nullable: true because if product is soft-deleted, the FK still holds
  @ManyToOne(() => Product, { nullable: true, eager: true })
  product: Product | null;
}