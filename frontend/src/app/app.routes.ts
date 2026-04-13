import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // Public
  { path: '', loadComponent: () => import('./features/shop/home/home.component').then(m => m.HomeComponent) },
  { path: 'products', loadComponent: () => import('./features/shop/product-list/product-list.component').then(m => m.ProductListComponent) },
  { path: 'products/:id', loadComponent: () => import('./features/shop/product-detail/product-detail.component').then(m => m.ProductDetailComponent) },

  // Auth
  { path: 'login',           loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent) },
  { path: 'register',        loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent) },
  { path: 'forgot-password', loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent) },
  { path: 'reset-password',  loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent) },

  // Customer only
  { path: 'cart',               canActivate: [authGuard], loadComponent: () => import('./features/shop/cart/cart.component').then(m => m.CartComponent) },
  { path: 'checkout',           canActivate: [authGuard], loadComponent: () => import('./features/shop/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'order-confirmation', canActivate: [authGuard], loadComponent: () => import('./features/shop/order-confirmation/order-confirmation.component').then(m => m.OrderConfirmationComponent) },
  { path: 'orders',             canActivate: [authGuard], loadComponent: () => import('./features/shop/order-history/order-history.component').then(m => m.OrderHistoryComponent) },
  { path: 'orders/:id',         canActivate: [authGuard], loadComponent: () => import('./features/shop/order-detail/order-detail.component').then(m => m.OrderDetailComponent) },
  { path: 'profile',            canActivate: [authGuard], loadComponent: () => import('./features/account/profile/profile.component').then(m => m.ProfileComponent) },
  { path: 'change-password',    canActivate: [authGuard], loadComponent: () => import('./features/account/change-password/change-password.component').then(m => m.ChangePasswordComponent) },

  // Admin (lazy, double-guarded)
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.adminRoutes),
  },

  { path: '**', redirectTo: '' },
];
