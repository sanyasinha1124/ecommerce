import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { User } from './User';
import { OrderItem } from './OrderItem';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash_on_delivery' | 'bank_transfer';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  placedAt: Date;

  @Column({ type: 'varchar' })
  paymentMethod: PaymentMethod;

  @Column({ type: 'real' })
  totalAmount: number;

  @ManyToOne(() => User, user => user.orders, { onDelete: 'CASCADE', nullable: false })
  user: User;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true })
  items: OrderItem[];
}