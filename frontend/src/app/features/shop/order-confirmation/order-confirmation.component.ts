// order-confirmation.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Order } from '../../../core/models/models';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule, DefaultImageComponent],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.css'],
})
export class OrderConfirmationComponent implements OnInit {
  order: Order | null = null;
  labels: Record<string, string> = { credit_card: 'Credit Card', debit_card: 'Debit Card', cash_on_delivery: 'Cash on Delivery', bank_transfer: 'Bank Transfer' };

  constructor(private router: Router) {}

  ngOnInit(): void {
    const nav = this.router.getCurrentNavigation();
    const state = nav?.extras?.state as { order: Order } | undefined;
    if (state?.order) { this.order = state.order; }
    else { this.router.navigate(['/orders']); }
  }
}
