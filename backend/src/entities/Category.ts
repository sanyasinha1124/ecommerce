import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { ProductType} from './ProductType';
import { SubCategory } from './SubCategory';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => ProductType, type => type.categories, { onDelete: 'RESTRICT', nullable: false })
  type: ProductType;

  @OneToMany(() => SubCategory, sub => sub.category)
  subCategories: SubCategory[];
}