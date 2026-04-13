// import { Component, OnInit } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { RouterModule, ActivatedRoute, Router } from '@angular/router';
// import { ProductService } from '../../../core/services/product.service';
// import { CartService } from '../../../core/services/cart.service';
// import { AuthService } from '../../../core/services/auth.service';
// import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
// import { Product } from '../../../core/models/models';

// @Component({
//   selector: 'app-product-detail',
//   standalone: true,
//   imports: [CommonModule, RouterModule, DefaultImageComponent],
//   templateUrl: './product-detail.component.html',
//   styleUrls: ['./product-detail.component.css'],
// })
// export class ProductDetailComponent implements OnInit {
//   product: Product | null = null;
//   loading = true;
//   quantity = 1;
//   addingToCart = false;
//   cartMessage = '';
//   cartError = '';

//   constructor(private route: ActivatedRoute, private router: Router,
//               private productService: ProductService, private cartService: CartService,
//               public authService: AuthService) {}

//   ngOnInit(): void {
//     const id = Number(this.route.snapshot.paramMap.get('id'));
//     this.productService.getOne(id).subscribe({
//       next: p => { this.product = p; this.loading = false; },
//       error: () => { this.loading = false; this.router.navigate(['/products']); },
//     });
//   }

//   // decQty(): void { if (this.quantity > 1) this.quantity--; }
//   // incQty(): void { if (this.product && this.quantity < this.product.stock) this.quantity++; }
  
//   decQty(): void { if (this.quantity > 1) this.quantity--; }
// incQty(): void { if (this.product && this.quantity < this.product.stock) this.quantity++; }
//   addToCart(): void {
//     if (!this.product) return;
//     this.addingToCart = true; this.cartMessage = ''; this.cartError = '';
//     this.cartService.addItem(this.product.id, this.quantity).subscribe({
//       next: () => { this.addingToCart = false; this.cartMessage = `${this.quantity} item(s) added to cart!`; setTimeout(() => this.cartMessage = '', 3000); },
//       error: err => { this.addingToCart = false; this.cartError = err.error?.message || 'Could not add to cart.'; },
//     });
//   }

//   share(): void {
//     const url = window.location.href;
//     if (navigator.share) {
//       navigator.share({ title: this.product?.name, url });
//     } else {
//       navigator.clipboard.writeText(url).then(() => { this.cartMessage = 'Link copied to clipboard!'; setTimeout(() => this.cartMessage = '', 3000); });
//     }
//   }

//   get breadcrumb() {
//     if (!this.product) return [];
//     const s = this.product.subCategory;
//     return [
//       { label: s.category.type.name, params: { typeId: s.category.type.id } },
//       { label: s.category.name,      params: { categoryId: s.category.id } },
//       { label: s.name,               params: { subCategoryId: s.id } },
//     ];
//   }
// }
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../../core/services/product.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { DefaultImageComponent } from '../../../shared/components/default-image/default-image.component';
import { Product } from '../../../core/models/models';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DefaultImageComponent],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  loading = true;
  quantity = 1;
  addingToCart = false;
  cartMessage = '';
  cartError = '';

  // Interactivity States
  activeTab: 'description' | 'specs' | 'reviews' = 'description';
  isWishlisted = false;

  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private productService: ProductService, 
    private cartService: CartService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.productService.getOne(id).subscribe({
      next: p => { 
        this.product = p; 
        this.loading = false; 
      },
      error: () => { 
        this.loading = false; 
        this.router.navigate(['/products']); 
      },
    });
  }

  // --- Interaction Methods ---

  selectTab(tab: 'description' | 'specs' | 'reviews'): void {
    this.activeTab = tab;
  }

  toggleWishlist(): void {
    this.isWishlisted = !this.isWishlisted;
    this.cartMessage = this.isWishlisted ? 'Added to wishlist!' : 'Removed from wishlist';
    setTimeout(() => this.cartMessage = '', 2000);
  }

  decQty(): void { 
    if (this.quantity > 1) this.quantity--; 
  }

  incQty(): void { 
    if (this.product && this.quantity < this.product.stock) this.quantity++; 
  }

  addToCart(): void {
    if (!this.product) return;
    this.addingToCart = true; 
    this.cartMessage = ''; 
    this.cartError = '';
    
    this.cartService.addItem(this.product.id, this.quantity).subscribe({
      next: () => { 
        this.addingToCart = false; 
        this.cartMessage = `Successfully added ${this.quantity} item(s) to cart!`; 
        setTimeout(() => this.cartMessage = '', 3000); 
      },
      error: err => { 
        this.addingToCart = false; 
        this.cartError = err.error?.message || 'Could not add to cart.'; 
      },
    });
  }

  share(): void {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: this.product?.name, url });
    } else {
      navigator.clipboard.writeText(url).then(() => { 
        this.cartMessage = 'Link copied to clipboard!'; 
        setTimeout(() => this.cartMessage = '', 3000); 
      });
    }
  }

  get breadcrumb() {
    if (!this.product) return [];
    const s = this.product.subCategory;
    return [
      { label: s.category.type.name, params: { typeId: s.category.type.id } },
      { label: s.category.name,      params: { categoryId: s.category.id } },
      { label: s.name,               params: { subCategoryId: s.id } },
    ];
  }
}