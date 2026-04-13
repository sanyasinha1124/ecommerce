import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Order, PaymentMethod } from '../models/models';

const API = '/api/orders';

@Injectable({ providedIn: 'root' })
export class OrderService {
  constructor(private http: HttpClient) {}

  placeOrder(paymentMethod: PaymentMethod): Observable<Order> {
    return this.http.post<Order>(API, { paymentMethod });
  }

  getOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(API);
  }

  getOrderDetail(id: number): Observable<Order> {
    return this.http.get<Order>(`${API}/${id}`);
  }
}
