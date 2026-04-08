import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { Type } from '../entities/Type';
import { Category } from '../entities/Category';
import { SubCategory } from '../entities/SubCategory';
import { Product } from '../entities/Product';
import bcrypt from 'bcrypt';
import { User } from '../entities/User';

async function seed() {
  await AppDataSource.initialize();

  const typeRepo = AppDataSource.getRepository(Type);
  const catRepo = AppDataSource.getRepository(Category);
  const subRepo = AppDataSource.getRepository(SubCategory);
  const prodRepo = AppDataSource.getRepository(Product);

  // --- Electronics ---
  const electronics = typeRepo.create({ name: 'Electronics' });
  await typeRepo.save(electronics);

  const peripherals = catRepo.create({ name: 'Computer Peripherals', type: electronics });
  await catRepo.save(peripherals);

  const keyboards = subRepo.create({ name: 'Keyboards', category: peripherals });
  await subRepo.save(keyboards);

  await prodRepo.save([
    prodRepo.create({ name: 'Anker Multimedia Keyboard', description: 'Compact wireless keyboard with multimedia keys', price: 2499, stock: 50, subCategory: keyboards }),
    prodRepo.create({ name: 'Mechanical RGB Keyboard', description: 'Tactile mechanical switches with RGB backlight', price: 5999, stock: 30, subCategory: keyboards }),
  ]);

  // --- Furniture ---
  const furniture = typeRepo.create({ name: 'Furniture' });
  await typeRepo.save(furniture);

  const homeFurniture = catRepo.create({ name: 'Home Furniture', type: furniture });
  await catRepo.save(homeFurniture);

  const tables = subRepo.create({ name: 'Tables', category: homeFurniture });
  await subRepo.save(tables);

  await prodRepo.save([
    // "table" search must find this
    prodRepo.create({ name: 'Wooden Table', description: 'Solid oak dining table, seats 6', price: 15999, stock: 10, subCategory: tables }),
  ]);

  // --- Stationery ---
  const stationery = typeRepo.create({ name: 'Stationery' });
  await typeRepo.save(stationery);

  const kids = catRepo.create({ name: 'Kids', type: stationery });
  await catRepo.save(kids);

  const textbooks = subRepo.create({ name: 'Textbooks', category: kids });
  await subRepo.save(textbooks);

  await prodRepo.save([
    // "table" search must also find this — cross-taxonomy result
    prodRepo.create({ name: 'Multiplication Table Book', description: 'Practice tables for kids ages 6-10', price: 299, stock: 200, subCategory: textbooks }),
  ]);
  
  // Inside seed() function, after product seeding:
const userRepo = AppDataSource.getRepository(User);
const adminExists = await userRepo.findOneBy({ email: 'admin@shop.com' });
if (!adminExists) {
  const admin = userRepo.create({
    name: 'Admin',
    email: 'admin@shop.com',
    passwordHash: await bcrypt.hash('Admin1234', 12),
    role: 'admin',
  });
  await userRepo.save(admin);
  console.log('Admin user created: admin@shop.com / Admin1234');
}

  console.log('Seed complete');
  process.exit(0);
}


seed().catch(err => { console.error(err); process.exit(1); });