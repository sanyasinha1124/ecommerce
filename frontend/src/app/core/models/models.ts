// user.model.ts
export interface User {
  id: number;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

// product.model.ts
export interface ProductType {
  id: number;
  name: string;
  categories: Category[];
}
export interface Category {
  id: number;
  name: string;
  subCategories: SubCategory[];
  type?: ProductType;
}
export interface SubCategory {
  id: number;
  name: string;
  category?: Category;
}
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  imagePath: string | null;
  isActive: boolean;
  subCategory: SubCategory & { category: Category & { type: ProductType } };
}
export interface ProductPage {
  products: Product[];
  pagination: { total: number; page: number; limit: number; totalPages: number; };
}

// cart.model.ts
export interface CartItem {
  id: number;
  quantity: number;
  product: Product;
}
export interface Cart {
  id: number;
  items: CartItem[];
  subtotal: number;
}

// order.model.ts
export type PaymentMethod = 'credit_card' | 'debit_card' | 'cash_on_delivery' | 'bank_transfer';
export interface OrderItem {
  id: number;
  quantity: number;
  priceAtPurchase: number;
  product: Product | null;
}
export interface Order {
  id: number;
  placedAt: string;
  paymentMethod: PaymentMethod;
  totalAmount: number;
  user?: User;
  items: OrderItem[];
}
