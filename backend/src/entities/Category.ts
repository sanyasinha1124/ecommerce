import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Type } from './Type';
import { SubCategory } from './SubCategory';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToOne(() => Type, type => type.categories, { onDelete: 'RESTRICT', nullable: false })
  type: Type;

  @OneToMany(() => SubCategory, sub => sub.category)
  subCategories: SubCategory[];
}