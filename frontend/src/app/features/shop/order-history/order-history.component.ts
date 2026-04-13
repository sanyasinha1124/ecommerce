// order-history.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { OrderService } from '../../../core/services/order.service';
import { Order } from '../../../core/models/models';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule, DefaultImageComponent,FormsModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  orders: Order[] = [];
  loading = true;
  labels: Record<string, string> = { credit_card: 'Credit Card', debit_card: 'Debit Card', cash_on_delivery: 'Cash on Delivery', bank_transfer: 'Bank Transfer' };

  constructor(private orderService: OrderService) {}
  ngOnInit(): void { this.orderService.getOrders().subscribe({ next: o => { this.orders = o; this.loading = false; }, error: () => { this.loading = false; } }); }
  count(o: Order): number { return o.items.reduce((s, i) => s + i.quantity, 0); }

  // State variables for the review modal
showReviewForm = false;
selectedProduct: any = null;
selectedOrderId: number | null = null;
userRating = 0;
hoverRating = 0;
userComment = '';

openReviewModal(product: any, orderId: number) {
  this.selectedProduct = product;
  this.selectedOrderId = orderId;
  this.showReviewForm = true;
  this.userRating = 0;
  this.userComment = '';
}

closeReviewModal() {
  this.showReviewForm = false;
}

setRating(rating: number) {
  this.userRating = rating;
}

submitReview() {
  if (!this.userRating) return;

  const reviewPayload = {
    productId: this.selectedProduct.id,
    orderId: this.selectedOrderId,
    rating: this.userRating,
    comment: this.userComment
  };

  console.log('Submitting review:', reviewPayload);
  
  // Here you would call your service:
  // this.productService.addReview(reviewPayload).subscribe(...)

  alert('Thank you for your review!');
  this.closeReviewModal();
}
}
