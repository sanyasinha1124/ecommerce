import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { SubCategory } from './SubCategory';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  // 'real' maps to SQLite REAL — stores decimal values correctly
  @Column({ type: 'real' })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ type: 'varchar', nullable: true })
  imagePath: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ManyToOne(() => SubCategory, sub => sub.products, { onDelete: 'RESTRICT', nullable: false })
  subCategory: SubCategory;
}