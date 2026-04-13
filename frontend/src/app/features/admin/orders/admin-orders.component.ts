import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminService } from '../../../core/services/admin.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Order } from '../../../core/models/models';

@Component({
  selector: 'app-admin-orders',
  standalone: true,
  imports: [CommonModule, DefaultImageComponent],
  templateUrl: './admin-orders.component.html',
  styleUrls: ['./admin-orders.component.css'],
})
export class AdminOrdersComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  expandedId: number | null = null;
  labels: Record<string, string> = {
    credit_card: 'Credit Card', debit_card: 'Debit Card',
    cash_on_delivery: 'Cash on Delivery', bank_transfer: 'Bank Transfer',
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
