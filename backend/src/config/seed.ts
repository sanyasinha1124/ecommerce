// import 'reflect-metadata';
// import { AppDataSource } from './data-source';
// import { ProductType } from '../entities/ProductType';
// import { Category } from '../entities/Category';
// import { SubCategory } from '../entities/SubCategory';
// import { Product } from '../entities/Product';
// import bcrypt from 'bcrypt';
// import { User } from '../entities/User';

// async function seed() {
//   await AppDataSource.initialize();

//   const typeRepo = AppDataSource.getRepository(ProductType);
//   const catRepo = AppDataSource.getRepository(Category);
//   const subRepo = AppDataSource.getRepository(SubCategory);
//   const prodRepo = AppDataSource.getRepository(Product);

//   // --- Electronics ---
//   const electronics = typeRepo.create({ name: 'Electronics' });
//   await typeRepo.save(electronics);

//   const peripherals = catRepo.create({ name: 'Computer Peripherals', type: electronics });
//   await catRepo.save(peripherals);

//   const keyboards = subRepo.create({ name: 'Keyboards', category: peripherals });
//   await subRepo.save(keyboards);

//   await prodRepo.save([
//     prodRepo.create({ name: 'Anker Multimedia Keyboard', description: 'Compact wireless keyboard with multimedia keys', price: 2499, stock: 50, subCategory: keyboards }),
//     prodRepo.create({ name: 'Mechanical RGB Keyboard', description: 'Tactile mechanical switches with RGB backlight', price: 5999, stock: 30, subCategory: keyboards }),
//   ]);

//   // --- Furniture ---
//   const furniture = typeRepo.create({ name: 'Furniture' });
//   await typeRepo.save(furniture);

//   const homeFurniture = catRepo.create({ name: 'Home Furniture', type: furniture });
//   await catRepo.save(homeFurniture);

//   const tables = subRepo.create({ name: 'Tables', category: homeFurniture });
//   await subRepo.save(tables);

//   await prodRepo.save([
//     // "table" search must find this
//     prodRepo.create({ name: 'Wooden Table', description: 'Solid oak dining table, seats 6', price: 15999, stock: 10, subCategory: tables }),
//   ]);

//   // --- Stationery ---
//   const stationery = typeRepo.create({ name: 'Stationery' });
//   await typeRepo.save(stationery);

//   const kids = catRepo.create({ name: 'Kids', type: stationery });
//   await catRepo.save(kids);

//   const textbooks = subRepo.create({ name: 'Textbooks', category: kids });
//   await subRepo.save(textbooks);

//   await prodRepo.save([
//     // "table" search must also find this — cross-taxonomy result
//     prodRepo.create({ name: 'Multiplication Table Book', description: 'Practice tables for kids ages 6-10', price: 299, stock: 200, subCategory: textbooks }),
//   ]);
  
//   // Inside seed() function, after product seeding:
// const userRepo = AppDataSource.getRepository(User);
// const adminExists = await userRepo.findOneBy({ email: 'admin@shop.com' });
// if (!adminExists) {
//   const admin = userRepo.create({
//     name: 'Admin',
//     email: 'admin@shop.com',
//     passwordHash: await bcrypt.hash('Admin1234', 12),
//     role: 'admin',
//   });
//   await userRepo.save(admin);
//   console.log('Admin user created: admin@shop.com / Admin1234');
// }

//   console.log('Seed complete');
//   process.exit(0);
// }


// seed().catch(err => { console.error(err); process.exit(1); });
import 'reflect-metadata';
import { AppDataSource } from './data-source';
import { ProductType } from '../entities/ProductType';
import { Category } from '../entities/Category';
import { SubCategory } from '../entities/SubCategory';
import { Product } from '../entities/Product';
import bcrypt from 'bcrypt';
import { User } from '../entities/User';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// ─── Image downloader ────────────────────────────────────────────
const IMAGES_DIR = path.join(__dirname, '../../../ProductImages');

function ensureImagesDir() {
  if (!fs.existsSync(IMAGES_DIR)) {
    fs.mkdirSync(IMAGES_DIR, { recursive: true });
    console.log(`Created folder: ${IMAGES_DIR}`);
  }
}

function downloadImage(url: string, filename: string): Promise<void> {
  return new Promise((resolve) => {
    const dest = path.join(IMAGES_DIR, filename);

    // Skip if already downloaded
    if (fs.existsSync(dest)) {
      process.stdout.write(`  skip  ${filename}\n`);
      resolve();
      return;
    }

    const file = fs.createWriteStream(dest);
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      // Follow redirects (301/302)
      if (response.statusCode === 301 || response.statusCode === 302) {
        file.close();
        fs.unlinkSync(dest);
        downloadImage(response.headers.location!, filename).then(resolve);
        return;
      }

      if (response.statusCode !== 200) {
        file.close();
        fs.unlinkSync(dest);
        process.stdout.write(`  fail  ${filename} (HTTP ${response.statusCode})\n`);
        resolve(); // don't crash — imagePath stays null
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        process.stdout.write(`  ok    ${filename}\n`);
        resolve();
      });
    });

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      process.stdout.write(`  err   ${filename} (${err.message})\n`);
      resolve(); // don't crash
    });

    request.setTimeout(15000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      process.stdout.write(`  timeout ${filename}\n`);
      resolve();
    });
  });
}

// ─── findOrCreate helper ─────────────────────────────────────────
async function findOrCreate<T extends { id: number; name: string }>(
  repo: any,
  name: string,
  extra: object = {}
): Promise<T> {
  const existing = await repo.findOneBy({ name });
  if (existing) return existing;
  const entity = repo.create({ name, ...extra });
  return repo.save(entity);
}

// ─── Product definitions with images ─────────────────────────────
// Using Unsplash Source API — reliable, free, no API key needed
// Format: https://images.unsplash.com/photo-<id>?w=600&q=80
const productDefs = [
  // ── Keyboards ──────────────────────────────────────────────────
  {
    name: 'Anker Multimedia Keyboard',
    description: 'Compact wireless keyboard with multimedia keys and silent membrane switches. Works across Windows and Mac.',
    price: 2499, stock: 50,
    sub: 'Keyboards',
    imageName: 'anker-keyboard.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
  },
  {
    name: 'Mechanical RGB Keyboard',
    description: 'Tactile mechanical switches with per-key RGB backlight. Anti-ghosting with N-key rollover for gamers.',
    price: 5999, stock: 30,
    sub: 'Keyboards',
    imageName: 'mechanical-rgb-keyboard.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=600&q=80',
  },
  {
    name: 'Logitech K380 Bluetooth Keyboard',
    description: 'Slim multi-device Bluetooth keyboard. Connect up to 3 devices and switch with one button press.',
    price: 3499, stock: 40,
    sub: 'Keyboards',
    imageName: 'logitech-k380.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
  },
  {
    name: 'Keychron Q1 Pro Mechanical Keyboard',
    description: 'Premium aluminum chassis with Gateron G Pro switches. Fully programmable via QMK/VIA firmware.',
    price: 12999, stock: 15,
    sub: 'Keyboards',
    imageName: 'keychron-q1.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
  },

  // ── Mice ───────────────────────────────────────────────────────
  {
    name: 'Logitech MX Master 3S',
    description: 'Advanced wireless mouse with electromagnetic scroll wheel. 8000 DPI sensor works on any surface including glass.',
    price: 8999, stock: 25,
    sub: 'Mice',
    imageName: 'logitech-mx-master.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
  },
  {
    name: 'Razer DeathAdder V3 Gaming Mouse',
    description: 'Ultra-lightweight gaming mouse at 59g. 30000 DPI optical sensor with Focus Pro technology.',
    price: 6499, stock: 20,
    sub: 'Mice',
    imageName: 'razer-deathadder.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&q=80',
  },
  {
    name: 'Portronics Toad Wireless Mouse',
    description: 'Ergonomic wireless mouse with 1600 DPI adjustable resolution. Silent click buttons and 15-month battery life.',
    price: 799, stock: 80,
    sub: 'Mice',
    imageName: 'portronics-toad.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?w=600&q=80',
  },

  // ── Chargers ───────────────────────────────────────────────────
  {
    name: 'Anker 65W GaN Fast Charger',
    description: '65W GaN technology charges laptop, tablet and phone simultaneously. 3 ports: 2 USB-C + 1 USB-A.',
    price: 3299, stock: 60,
    sub: 'Chargers',
    imageName: 'anker-charger.jpg',
    imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY1Uye5a9l_Gl01Lj4fUqUU0doTDxC75dzdw&s', // Local image to test fallback
  },
  {
    name: 'Samsung 25W Super Fast Charger',
    description: 'Original Samsung 25W PD adapter with USB-C cable. Charges Galaxy S series in 30 minutes.',
    price: 1499, stock: 45,
    sub: 'Chargers',
    imageName: 'samsung-charger.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&q=80',
  },

  // ── Tables ─────────────────────────────────────────────────────
  {
    name: 'Wooden Dining Table',
    description: 'Solid oak dining table seats 6 comfortably. Mortise and tenon joinery. Available in natural and walnut finish.',
    price: 15999, stock: 10,
    sub: 'Tables',
    imageName: 'wooden-dining-table.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
  },
  {
    name: 'Folding Study Table',
    description: 'Space-saving folding table with bookshelf and drawer. Engineered wood with scratch-resistant laminate.',
    price: 4999, stock: 18,
    sub: 'Tables',
    imageName: 'folding-study-table.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&q=80',
  },
  {
    name: 'Glass Coffee Table',
    description: 'Tempered glass top with stainless steel legs. Minimalist design fits any living room. Weight capacity 80kg.',
    price: 8499, stock: 8,
    sub: 'Tables',
    imageName: 'glass-coffee-table.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1567016432779-094069958ea5?w=600&q=80',
  },

  // ── Chairs ─────────────────────────────────────────────────────
  {
    name: 'Ergonomic Mesh Office Chair',
    description: 'Adjustable lumbar support with breathable mesh back. Height and armrest adjustable. Built for 8-hour comfort.',
    price: 11999, stock: 12,
    sub: 'Chairs',
    imageName: 'ergonomic-chair.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=600&q=80',
  },
  {
    name: 'Wooden Dining Chair Set of 4',
    description: 'Solid sheesham wood chairs with cushioned seats. Handcrafted with traditional joinery. Cushion cover washable.',
    price: 9999, stock: 6,
    sub: 'Chairs',
    imageName: 'dining-chair-set.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=600&q=80',
  },

  // ── Desks ──────────────────────────────────────────────────────
  {
    name: 'L-Shaped Computer Desk',
    description: 'Corner desk with monitor shelf and keyboard tray. Steel frame supports 150kg. Cable management grommets included.',
    price: 13499, stock: 9,
    sub: 'Desks',
    imageName: 'l-shaped-desk.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?w=600&q=80',
  },
  {
    name: 'Height Adjustable Standing Desk',
    description: 'Electric height adjustment 72cm to 120cm. Dual motor with 4 memory presets. Anti-collision detection.',
    price: 28999, stock: 5,
    sub: 'Desks',
    imageName: 'standing-desk.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=600&q=80',
  },

  // ── Textbooks ──────────────────────────────────────────────────
  {
    name: 'Multiplication Table Book',
    description: 'Illustrated practice book for tables 1 to 20. For kids ages 6-10. Includes quizzes and reward stickers.',
    price: 299, stock: 200,
    sub: 'Textbooks',
    imageName: 'multiplication-table-book.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=600&q=80',
  },
  {
    name: 'Primary Mathematics Workbook Grade 3',
    description: 'NCERT-aligned maths workbook with step-by-step solutions. Covers all Grade 3 topics.',
    price: 449, stock: 150,
    sub: 'Textbooks',
    imageName: 'maths-workbook.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&q=80',
  },
  {
    name: 'Phonics Reading Programme Set',
    description: 'Complete 5-book phonics series for early readers. From letter sounds to full sentences. Parent guide included.',
    price: 1299, stock: 80,
    sub: 'Textbooks',
    imageName: 'phonics-set.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80',
  },

  // ── Art Supplies ───────────────────────────────────────────────
  {
    name: 'Camel Student Watercolour Set 24',
    description: '24 vibrant watercolour cakes with palette box, mixing area and two brushes. Non-toxic, ASTM certified.',
    price: 399, stock: 120,
    sub: 'Art Supplies',
    imageName: 'watercolour-set.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
  },
  {
    name: 'Faber-Castell Colour Pencils 48',
    description: 'Pre-sharpened colour pencils with 3.3mm break-resistant leads. High pigment concentration for smooth laydown.',
    price: 849, stock: 95,
    sub: 'Art Supplies',
    imageName: 'faber-castell-pencils.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=600&q=80',
  },

  // ── Notebooks ──────────────────────────────────────────────────
  {
    name: 'Leuchtturm1917 A5 Dotted Notebook',
    description: 'Premium hardcover with 251 numbered pages, 2 bookmarks and elastic closure. Ink-proof 80gsm paper.',
    price: 1899, stock: 55,
    sub: 'Notebooks',
    imageName: 'leuchtturm-notebook.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=600&q=80',
  },
  {
    name: 'Classmate Interleaf Notebook Pack of 6',
    description: 'Six 172-page ruled notebooks with interleaf for annotations. Ideal for students and professionals.',
    price: 299, stock: 300,
    sub: 'Notebooks',
    imageName: 'classmate-notebook.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=600&q=80',
  },

  // ── Pens ───────────────────────────────────────────────────────
  {
    name: 'Parker Jotter Ballpoint Pen',
    description: 'Iconic stainless steel ballpoint with medium blue ink. Retractable clip design. Refillable with Quink cartridges.',
    price: 749, stock: 100,
    sub: 'Pens',
    imageName: 'parker-pen.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?w=600&q=80',
  },
  {
    name: 'Pilot G2 Gel Pen Pack of 10',
    description: 'Smooth-writing retractable gel pens in 10 assorted colours. 0.7mm tip with rubber grip. Refillable.',
    price: 499, stock: 140,
    sub: 'Pens',
    imageName: 'pilot-g2-pen.jpg',
    imageUrl: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600&q=80',
  },
];

// ─── Main seed function ──────────────────────────────────────────
async function seed() {
  await AppDataSource.initialize();
  ensureImagesDir();

  const typeRepo = AppDataSource.getRepository(ProductType);
  const catRepo  = AppDataSource.getRepository(Category);
  const subRepo  = AppDataSource.getRepository(SubCategory);
  const prodRepo = AppDataSource.getRepository(Product);
  const userRepo = AppDataSource.getRepository(User);

  // ─── Taxonomy ────────────────────────────────────────────────
  console.log('\n1. Building taxonomy...');

  const electronics    = await findOrCreate(typeRepo, 'Electronics');
  const furniture      = await findOrCreate(typeRepo, 'Furniture');
  const stationery     = await findOrCreate(typeRepo, 'Stationery');

  const peripherals    = await findOrCreate(catRepo, 'Computer Peripherals', { type: electronics });
  const mobileAcc      = await findOrCreate(catRepo, 'Mobile Accessories',   { type: electronics });
  const homeFurniture  = await findOrCreate(catRepo, 'Home Furniture',       { type: furniture });
  const officeFurni    = await findOrCreate(catRepo, 'Office Furniture',     { type: furniture });
  const kids           = await findOrCreate(catRepo, 'Kids',                 { type: stationery });
  const officeSupplies = await findOrCreate(catRepo, 'Office Supplies',      { type: stationery });

  const subCategoryMap: Record<string, any> = {
    'Keyboards':    await findOrCreate(subRepo, 'Keyboards',    { category: peripherals }),
    'Mice':         await findOrCreate(subRepo, 'Mice',         { category: peripherals }),
    'Chargers':     await findOrCreate(subRepo, 'Chargers',     { category: mobileAcc }),
    'Tables':       await findOrCreate(subRepo, 'Tables',       { category: homeFurniture }),
    'Chairs':       await findOrCreate(subRepo, 'Chairs',       { category: homeFurniture }),
    'Desks':        await findOrCreate(subRepo, 'Desks',        { category: officeFurni }),
    'Textbooks':    await findOrCreate(subRepo, 'Textbooks',    { category: kids }),
    'Art Supplies': await findOrCreate(subRepo, 'Art Supplies', { category: kids }),
    'Notebooks':    await findOrCreate(subRepo, 'Notebooks',    { category: officeSupplies }),
    'Pens':         await findOrCreate(subRepo, 'Pens',         { category: officeSupplies }),
  };

  console.log('   done — 3 types, 6 categories, 10 sub-categories');

  // ─── Download images ─────────────────────────────────────────
  console.log('\n2. Downloading images...');
  for (const p of productDefs) {
    await downloadImage(p.imageUrl, p.imageName);
  }

  // ─── Products ────────────────────────────────────────────────
  console.log('\n3. Seeding products...');
  let created = 0;
  let updated = 0;

  for (const def of productDefs) {
    const subCategory = subCategoryMap[def.sub];
    const existing = await prodRepo.findOneBy({ name: def.name });

    if (existing) {
      // Update imagePath on existing products
      await prodRepo.update(existing.id, { imagePath: def.imageName });
      updated++;
    } else {
      await prodRepo.save(
        prodRepo.create({
          name:        def.name,
          description: def.description,
          price:       def.price,
          stock:       def.stock,
          subCategory,
          imagePath:   def.imageName,
        })
      );
      created++;
    }
  }

  console.log(`   created: ${created}  updated: ${updated}`);

  // ─── Admin user ───────────────────────────────────────────────
  console.log('\n4. Admin user...');
  const adminExists = await userRepo.findOneBy({ email: 'admin@shop.com' });
  if (!adminExists) {
    await userRepo.save(userRepo.create({
      name:         'Admin',
      email:        'admin@shop.com',
      passwordHash: await bcrypt.hash('Admin1234', 12),
      role:         'admin',
    }));
    console.log('   created: admin@shop.com / Admin1234');
  } else {
    console.log('   already exists — skipped');
  }

  // ─── Summary ─────────────────────────────────────────────────
  console.log('\n─────────────────────────────────────────');
  console.log('Seed complete');
  console.log('\n  Electronics  → Computer Peripherals → Keyboards (4), Mice (3)');
  console.log('               → Mobile Accessories   → Chargers (2)');
  console.log('  Furniture    → Home Furniture        → Tables (3), Chairs (2)');
  console.log('               → Office Furniture      → Desks (2)');
  console.log('  Stationery   → Kids                  → Textbooks (3), Art Supplies (2)');
  console.log('               → Office Supplies       → Notebooks (2), Pens (2)');
  console.log('\n  Total: 25 products with images');
  console.log('─────────────────────────────────────────\n');

  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });