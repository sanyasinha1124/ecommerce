import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1775627614165 implements MigrationInterface {
    name = 'InitSchema1775627614165'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "types" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, CONSTRAINT "UQ_fa170fda66d232af69b7f880c9e" UNIQUE ("name"))`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "typeId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "sub_categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" real NOT NULL, "stock" integer NOT NULL DEFAULT (0), "imagePath" varchar, "isActive" boolean NOT NULL DEFAULT (1), "subCategoryId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL DEFAULT (1), "priceAtPurchase" decimal(10,2) NOT NULL, "orderId" integer, "productId" integer)`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "placedAt" datetime NOT NULL DEFAULT (datetime('now')), "paymentMethod" varchar NOT NULL, "totalAmount" real NOT NULL, "userId" integer NOT NULL)`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL DEFAULT (1), "cartId" integer NOT NULL, "productId" integer)`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer, CONSTRAINT "REL_69828a178f152f157dcf2f70a8" UNIQUE ("userId"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "email" varchar NOT NULL, "passwordHash" varchar NOT NULL, "role" varchar NOT NULL DEFAULT ('customer'), "isLocked" boolean NOT NULL DEFAULT (0), "resetCode" varchar, "resetCodeExpiry" datetime, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"))`);
        await queryRunner.query(`CREATE TABLE "temporary_categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "typeId" integer NOT NULL, CONSTRAINT "FK_d55ba160d1a55bc93221dbac150" FOREIGN KEY ("typeId") REFERENCES "types" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_categories"("id", "name", "typeId") SELECT "id", "name", "typeId" FROM "categories"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`ALTER TABLE "temporary_categories" RENAME TO "categories"`);
        await queryRunner.query(`CREATE TABLE "temporary_sub_categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL, CONSTRAINT "FK_dfa3adf1b46e582626b295d0257" FOREIGN KEY ("categoryId") REFERENCES "categories" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_sub_categories"("id", "name", "categoryId") SELECT "id", "name", "categoryId" FROM "sub_categories"`);
        await queryRunner.query(`DROP TABLE "sub_categories"`);
        await queryRunner.query(`ALTER TABLE "temporary_sub_categories" RENAME TO "sub_categories"`);
        await queryRunner.query(`CREATE TABLE "temporary_products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" real NOT NULL, "stock" integer NOT NULL DEFAULT (0), "imagePath" varchar, "isActive" boolean NOT NULL DEFAULT (1), "subCategoryId" integer NOT NULL, CONSTRAINT "FK_ad42985fb27aa9016b16ee740ec" FOREIGN KEY ("subCategoryId") REFERENCES "sub_categories" ("id") ON DELETE RESTRICT ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_products"("id", "name", "description", "price", "stock", "imagePath", "isActive", "subCategoryId") SELECT "id", "name", "description", "price", "stock", "imagePath", "isActive", "subCategoryId" FROM "products"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`ALTER TABLE "temporary_products" RENAME TO "products"`);
        await queryRunner.query(`CREATE TABLE "temporary_order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL DEFAULT (1), "priceAtPurchase" decimal(10,2) NOT NULL, "orderId" integer, "productId" integer, CONSTRAINT "FK_f1d359a55923bb45b057fbdab0d" FOREIGN KEY ("orderId") REFERENCES "orders" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_cdb99c05982d5191ac8465ac010" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE NO ACTION ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_order_items"("id", "quantity", "priceAtPurchase", "orderId", "productId") SELECT "id", "quantity", "priceAtPurchase", "orderId", "productId" FROM "order_items"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_order_items" RENAME TO "order_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "placedAt" datetime NOT NULL DEFAULT (datetime('now')), "paymentMethod" varchar NOT NULL, "totalAmount" real NOT NULL, "userId" integer NOT NULL, CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_orders"("id", "placedAt", "paymentMethod", "totalAmount", "userId") SELECT "id", "placedAt", "paymentMethod", "totalAmount", "userId" FROM "orders"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`ALTER TABLE "temporary_orders" RENAME TO "orders"`);
        await queryRunner.query(`CREATE TABLE "temporary_cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL DEFAULT (1), "cartId" integer NOT NULL, "productId" integer, CONSTRAINT "FK_edd714311619a5ad09525045838" FOREIGN KEY ("cartId") REFERENCES "carts" ("id") ON DELETE CASCADE ON UPDATE NO ACTION, CONSTRAINT "FK_72679d98b31c737937b8932ebe6" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_cart_items"("id", "quantity", "cartId", "productId") SELECT "id", "quantity", "cartId", "productId" FROM "cart_items"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`ALTER TABLE "temporary_cart_items" RENAME TO "cart_items"`);
        await queryRunner.query(`CREATE TABLE "temporary_carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer, CONSTRAINT "REL_69828a178f152f157dcf2f70a8" UNIQUE ("userId"), CONSTRAINT "FK_69828a178f152f157dcf2f70a89" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE NO ACTION)`);
        await queryRunner.query(`INSERT INTO "temporary_carts"("id", "userId") SELECT "id", "userId" FROM "carts"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`ALTER TABLE "temporary_carts" RENAME TO "carts"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "carts" RENAME TO "temporary_carts"`);
        await queryRunner.query(`CREATE TABLE "carts" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "userId" integer, CONSTRAINT "REL_69828a178f152f157dcf2f70a8" UNIQUE ("userId"))`);
        await queryRunner.query(`INSERT INTO "carts"("id", "userId") SELECT "id", "userId" FROM "temporary_carts"`);
        await queryRunner.query(`DROP TABLE "temporary_carts"`);
        await queryRunner.query(`ALTER TABLE "cart_items" RENAME TO "temporary_cart_items"`);
        await queryRunner.query(`CREATE TABLE "cart_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL DEFAULT (1), "cartId" integer NOT NULL, "productId" integer)`);
        await queryRunner.query(`INSERT INTO "cart_items"("id", "quantity", "cartId", "productId") SELECT "id", "quantity", "cartId", "productId" FROM "temporary_cart_items"`);
        await queryRunner.query(`DROP TABLE "temporary_cart_items"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME TO "temporary_orders"`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "placedAt" datetime NOT NULL DEFAULT (datetime('now')), "paymentMethod" varchar NOT NULL, "totalAmount" real NOT NULL, "userId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "orders"("id", "placedAt", "paymentMethod", "totalAmount", "userId") SELECT "id", "placedAt", "paymentMethod", "totalAmount", "userId" FROM "temporary_orders"`);
        await queryRunner.query(`DROP TABLE "temporary_orders"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME TO "temporary_order_items"`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "quantity" integer NOT NULL DEFAULT (1), "priceAtPurchase" decimal(10,2) NOT NULL, "orderId" integer, "productId" integer)`);
        await queryRunner.query(`INSERT INTO "order_items"("id", "quantity", "priceAtPurchase", "orderId", "productId") SELECT "id", "quantity", "priceAtPurchase", "orderId", "productId" FROM "temporary_order_items"`);
        await queryRunner.query(`DROP TABLE "temporary_order_items"`);
        await queryRunner.query(`ALTER TABLE "products" RENAME TO "temporary_products"`);
        await queryRunner.query(`CREATE TABLE "products" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "description" text NOT NULL, "price" real NOT NULL, "stock" integer NOT NULL DEFAULT (0), "imagePath" varchar, "isActive" boolean NOT NULL DEFAULT (1), "subCategoryId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "products"("id", "name", "description", "price", "stock", "imagePath", "isActive", "subCategoryId") SELECT "id", "name", "description", "price", "stock", "imagePath", "isActive", "subCategoryId" FROM "temporary_products"`);
        await queryRunner.query(`DROP TABLE "temporary_products"`);
        await queryRunner.query(`ALTER TABLE "sub_categories" RENAME TO "temporary_sub_categories"`);
        await queryRunner.query(`CREATE TABLE "sub_categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "categoryId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "sub_categories"("id", "name", "categoryId") SELECT "id", "name", "categoryId" FROM "temporary_sub_categories"`);
        await queryRunner.query(`DROP TABLE "temporary_sub_categories"`);
        await queryRunner.query(`ALTER TABLE "categories" RENAME TO "temporary_categories"`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" integer PRIMARY KEY AUTOINCREMENT NOT NULL, "name" varchar NOT NULL, "typeId" integer NOT NULL)`);
        await queryRunner.query(`INSERT INTO "categories"("id", "name", "typeId") SELECT "id", "name", "typeId" FROM "temporary_categories"`);
        await queryRunner.query(`DROP TABLE "temporary_categories"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "carts"`);
        await queryRunner.query(`DROP TABLE "cart_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "sub_categories"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`DROP TABLE "types"`);
    }

}
