import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/models';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DefaultImageComponent],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.css'],
})
export class OrderDetailComponent implements OnInit {
  order: Order | null = null;
  loading = true;
  labels: Record<string, string> = {
    credit_card: 'Credit Card', debit_card: 'Debit Card',
    cash_on_delivery: 'Cash on Delivery', bank_transfer: 'Bank Transfer'
  };

  constructor(private route: ActivatedRoute, private router: Router, private orderService: OrderService) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.orderService.getOrderDetail(id).subscribe({
      next: o => { this.order = o; this.loading = false; },
      error: () => { this.loading = false; this.router.navigate(['/orders']); },
    });
  }

  get itemCount(): number { return this.order?.items.reduce((s, i) => s + i.quantity, 0) ?? 0; }
}
