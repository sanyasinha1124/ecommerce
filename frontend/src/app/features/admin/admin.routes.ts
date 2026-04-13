import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'products',  loadComponent: () => import('./products/admin-products.component').then(m => m.AdminProductsComponent) },
      { path: 'customers', loadComponent: () => import('./customers/admin-customers.component').then(m => m.AdminCustomersComponent) },
      { path: 'orders',    loadComponent: () => import('./orders/admin-orders.component').then(m => m.AdminOrdersComponent) },
      { path: '',          redirectTo: 'products', pathMatch: 'full' },
    ],
  },
];
