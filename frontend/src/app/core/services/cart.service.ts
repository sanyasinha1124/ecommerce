import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Cart } from '../models/models';

const API = '/api/cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartCountSubject = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getCart(): Observable<Cart> {
    return this.http.get<Cart>(API).pipe(
      tap(cart => this.cartCountSubject.next(cart.items.length))
    );
  }

  addItem(productId: number, quantity: number): Observable<Cart> {
    return this.http.post<Cart>(`${API}/items`, { productId, quantity }).pipe(
      tap(cart => this.cartCountSubject.next(cart.items.length))
    );
  }

  updateQuantity(itemId: number, quantity: number): Observable<Cart> {
    return this.http.patch<Cart>(`${API}/items/${itemId}`, { quantity }).pipe(
      tap(cart => this.cartCountSubject.next(cart.items.length))
    );
  }

  removeItem(itemId: number): Observable<Cart> {
    return this.http.delete<Cart>(`${API}/items/${itemId}`).pipe(
      tap(cart => this.cartCountSubject.next(cart.items.length))
    );
  }

  clearCount(): void { this.cartCountSubject.next(0); }
}
