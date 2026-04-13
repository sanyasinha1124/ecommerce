import { Component, OnInit, HostListener, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Cart, User } from '../../../core/models/models';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';


@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  currentUser$: Observable<User | null>;
  cartCount = 0;
  menuOpen = false;

  constructor(
    public authService: AuthService,
    private cartService: CartService,
    private router: Router
  ) {
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.currentUser$.subscribe(user => {
      if (user?.role === 'customer') {
        this.cartService.getCart().subscribe({
          // next: cart => this.cartCount = cart.items.length,
          next: (cart: Cart) => this.cartCount = cart.items.length,
          error: ()   => this.cartCount = 0,
        });
      } else {
        this.cartCount = 0;
      }
    });
    this.cartService.cartCount$.subscribe((count: number) => this.cartCount = count);
  }

  logout(): void {
    this.menuOpen = false;
    this.authService.logout().subscribe(() => this.router.navigate(['/']));
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: Event): void {
    const target = e.target as HTMLElement;
    if (!target.closest('.navbar__user-menu')) this.menuOpen = false;
  }
}
