import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { Order } from './Order';
import { Cart } from './Cart';

export type UserRole = 'customer' | 'admin';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  // SQLite has no enum type — varchar + TS union gives same safety
  @Column({ type: 'varchar', default: 'customer' })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ type: 'varchar', nullable: true })
  resetCode: string | null;

  @Column({ type: 'datetime', nullable: true })
  resetCodeExpiry: Date | null;

  @OneToMany(() => Order, order => order.user)
  orders: Order[];

  @OneToOne(() => Cart, cart => cart.user)
  cart: Cart;
}