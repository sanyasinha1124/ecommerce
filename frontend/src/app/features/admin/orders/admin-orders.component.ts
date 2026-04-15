import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Order } from '../../../core/models/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, DefaultImageComponent],
  template: `
    <div class="admin-wrapper">
      <div class="page-header">
        <div class="header-text">
          <h1>Customer Orders</h1>
          <p class="subtitle">{{ orders.length }} total transactions</p>
        </div>
      </div>

      <div *ngIf="loading" class="loader-box">
        <div class="spinner"></div>
        <p>Syncing orders...</p>
      </div>

      <div *ngIf="!loading" class="table-card">
        <table class="styled-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Payment</th>
              <th>Items</th>
              <th>Total</th>
              <th class="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            <ng-container *ngFor="let order of orders">
              <tr class="main-row" [class.active]="expandedId === order.id">
                <td class="order-id">#{{ order.id }}</td>
                <td>
                  <div class="user-info">
                    <span class="user-name">{{ order.user?.name }}</span>
                    <span class="user-email">{{ order.user?.email }}</span>
                  </div>
                </td>
                <td class="date-cell">{{ order.placedAt | date:'mediumDate' }}</td>
                <td>
                  <span class="payment-badge">{{ labels[order.paymentMethod] }}</span>
                </td>
                <td class="count-cell">{{ count(order) }} units</td>
                <td class="price-bold">₹{{ order.totalAmount | number }}</td>
                <td class="text-right">
                  <button class="btn-toggle" (click)="toggle(order.id)">
                    {{ expandedId === order.id ? 'Close' : 'View' }}
                  </button>
                </td>
              </tr>

              <tr *ngIf="expandedId === order.id" class="details-row">
                <td colspan="7">
                  <div class="expanded-panel">
                    <div class="panel-header">Order Summary</div>
                    <div *ngFor="let item of order.items" class="order-item">
                      <app-default-image
                        class="item-img"
                        [imagePath]="item.product?.imagePath ?? null"
                        [alt]="item.product?.name ?? ''">
                      </app-default-image>
                      
                      <div class="item-details">
                        <span class="item-name">{{ item.product?.name ?? 'Deleted product' }}</span>
                        <span class="item-qty">Quantity: {{ item.quantity }}</span>
                      </div>

                      <div class="item-pricing">
                     <span class="unit-price">&#64; ₹{{ item.priceAtPurchase | number }}</span>
                        <span class="subtotal">₹{{ (item.priceAtPurchase * item.quantity) | number }}</span>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            </ng-container>
          </tbody>
        </table>

        <div *ngIf="orders.length === 0" class="empty-state">
          <div class="icon">📦</div>
          <h3>No orders yet</h3>
          <p>When customers place orders, they will appear here.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      font-family: 'Segoe UI', sans-serif !important;
      --pink: #ff3f6c;
      --charcoal: #282c3f;
      --grey: #94969f;
      --light-pink: #fff1f4;
      --border-color: #eaeaec;
    }

    .admin-wrapper {
      padding: 2rem;
      background-color: #f5f5f6;
      min-height: 100vh;
    }

    /* Header */
    .page-header { margin-bottom: 30px; }
    h1 { font-size: 24px; font-weight: 700; color: var(--charcoal); margin: 0; }
    .subtitle { color: var(--grey); margin: 5px 0 0; font-size: 14px; }

    /* Table Container */
    .table-card {
      background: white;
      border-radius: 8px;
      border: 1px solid var(--border-color);
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.03);
    }

    .styled-table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
    }

    .styled-table th {
      background: #f5f5f6;
      padding: 16px;
      color: var(--grey);
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 1px solid var(--border-color);
    }

    .styled-table td {
      padding: 16px;
      border-bottom: 1px solid var(--border-color);
      color: var(--charcoal);
      vertical-align: middle;
      font-size: 14px;
    }

    .main-row:hover { background-color: #fafafa; }
    .main-row.active { background-color: var(--light-pink); }

    /* ID & Text */
    .order-id { font-weight: 700; color: var(--charcoal); }
    .price-bold { font-weight: 700; color: var(--charcoal); }
    .date-cell { color: #535766; }
    .count-cell { font-weight: 600; color: #535766; }
    .text-right { text-align: right; }

    /* User Info */
    .user-info { display: flex; flex-direction: column; }
    .user-name { font-weight: 700; color: var(--charcoal); }
    .user-email { font-size: 12px; color: var(--grey); }

    /* Badges */
    .payment-badge {
      background: #eefaf6;
      color: #1d896c;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      border: 1px solid #dcf3eb;
    }

    /* Toggle Button */
    .btn-toggle {
      background: white;
      color: var(--charcoal);
      border: 1px solid #d4d5d9;
      padding: 6px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      transition: all 0.2s;
    }
    .btn-toggle:hover {
      background: var(--charcoal);
      color: white;
      border-color: var(--charcoal);
    }

    /* Expanded Content */
    .details-row td { padding: 0; background: #fff; }
    .expanded-panel { 
      padding: 24px; 
      border-bottom: 3px solid var(--pink);
      animation: slideIn 0.2s ease-out;
    }
    .panel-header { 
      font-size: 12px; 
      font-weight: 700; 
      text-transform: uppercase; 
      color: var(--grey); 
      margin-bottom: 15px;
      letter-spacing: 1px;
    }
    
    .order-item {
      display: flex;
      align-items: center;
      padding: 12px 0;
      border-bottom: 1px solid #f5f5f6;
      gap: 1.5rem;
    }
    .order-item:last-child { border-bottom: none; }

    .item-img { width: 50px; height: 65px; border-radius: 4px; overflow: hidden; border: 1px solid var(--border-color); object-fit: cover; }
    .item-details { flex: 1; display: flex; flex-direction: column; }
    .item-name { font-weight: 700; color: var(--charcoal); font-size: 14px; }
    .item-qty { color: var(--grey); font-size: 12px; margin-top: 4px; }
    
    .item-pricing { text-align: right; }
    .unit-price { display: block; font-size: 11px; color: var(--grey); }
    .subtotal { font-weight: 700; color: var(--pink); font-size: 14px; }

    /* Loading & Empty States */
    .loader-box { padding: 5rem; text-align: center; color: var(--grey); }
    .spinner {
      width: 35px; height: 35px; border: 3px solid #f3f3f3; border-top: 3px solid var(--pink);
      border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 15px;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    @keyframes slideIn { from { opacity: 0; transform: translateY(-5px); } to { opacity: 1; transform: translateY(0); } }

    .empty-state { padding: 5rem; text-align: center; color: var(--grey); }
    .empty-state .icon { font-size: 40px; margin-bottom: 15px; }
  `]
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  expandedId: number | null = null;
  labels: Record<string, string> = {
    credit_card: 'Credit Card', 
    debit_card: 'Debit Card',
    cash_on_delivery: 'COD', 
    bank_transfer: 'Transfer',
  };

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.adminService.getOrders().subscribe({
      next: o => { this.orders = o; this.loading = false; },
      error: () => { this.loading = false; },
    });
  }

  toggle(id: number): void { this.expandedId = this.expandedId === id ? null : id; }
  count(o: Order): number { return o.items.reduce((s, i) => s + i.quantity, 0); }
}