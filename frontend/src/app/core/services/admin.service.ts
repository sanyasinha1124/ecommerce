import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductType, Order } from '../models/models';

// const API = 'http://localhost:3000/api/admin';
const API = '/api/admin';
@Injectable({ providedIn: 'root' })
export class AdminService {
  constructor(private http: HttpClient) {}

  getProducts(): Observable<Product[]> { return this.http.get<Product[]>(`${API}/products`); }
  createProduct(data: FormData): Observable<Product> { return this.http.post<Product>(`${API}/products`, data); }
  updateProduct(id: number, data: FormData): Observable<Product> { return this.http.put<Product>(`${API}/products/${id}`, data); }
  deleteProduct(id: number): Observable<any> { return this.http.delete(`${API}/products/${id}`); }

  getCustomers(): Observable<any[]> { return this.http.get<any[]>(`${API}/customers`); }
  toggleLock(id: number): Observable<any> { return this.http.patch(`${API}/customers/${id}/lock`, {}); }

  getOrders(): Observable<Order[]> { return this.http.get<Order[]>(`${API}/orders`); }
  getOrderDetail(id: number): Observable<Order> { return this.http.get<Order>(`${API}/orders/${id}`); }

  getTaxonomy(): Observable<ProductType[]> { return this.http.get<ProductType[]>(`${API}/products/taxonomy`); }
}
