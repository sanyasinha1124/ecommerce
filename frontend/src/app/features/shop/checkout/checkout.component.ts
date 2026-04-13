import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CartService } from '../../../core/services/cart.service';
import { OrderService } from '../../../core/services/order.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Cart, PaymentMethod } from '../../../core/models/models';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, DefaultImageComponent],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent implements OnInit {
  cart: Cart | null = null;
  loading = true; placing = false; error = '';
  form: FormGroup;

  methods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: 'credit_card',      label: 'Credit Card',      icon: '💳' },
    { value: 'debit_card',       label: 'Debit Card',       icon: '🏦' },
    { value: 'cash_on_delivery', label: 'Cash on Delivery', icon: '💵' },
    { value: 'bank_transfer',    label: 'Bank Transfer',    icon: '🏛️' },
  ];

  constructor(private fb: FormBuilder, private cartService: CartService,
              private orderService: OrderService, private router: Router) {
    this.form = this.fb.group({ paymentMethod: ['', Validators.required] });
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe({
      next: c => { this.cart = c; this.loading = false; if (!c.items.length) this.router.navigate(['/cart']); },
      error: () => { this.loading = false; },
    });
  }

  place(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.placing = true; this.error = '';
    this.orderService.placeOrder(this.form.value.paymentMethod).subscribe({
      next: order => { this.cartService.clearCount(); this.router.navigate(['/order-confirmation'], { state: { order } }); },
      error: err  => { this.placing = false; this.error = err.error?.message || 'Could not place order.'; },
    });
  }

  get itemCount(): number { return this.cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0; }
}
