import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Cart } from '../../../core/models/models';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, DefaultImageComponent],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  cart: Cart | null = null;
  loading = true;
  updatingId: number | null = null;

  constructor(private cartService: CartService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.cartService.getCart().subscribe({ next: c => { this.cart = c; this.loading = false; }, error: () => { this.loading = false; } });
  }

  updateQty(id: number, qty: number): void {
    if (qty < 1) return;
    this.updatingId = id;
    this.cartService.updateQuantity(id, qty).subscribe({ next: c => { this.cart = c; this.updatingId = null; }, error: () => { this.updatingId = null; } });
  }

  remove(id: number): void {
    this.updatingId = id;
    this.cartService.removeItem(id).subscribe({ next: c => { this.cart = c; this.updatingId = null; }, error: () => { this.updatingId = null; } });
  }

  get itemCount(): number { return this.cart?.items.reduce((s, i) => s + i.quantity, 0) ?? 0; }
}
