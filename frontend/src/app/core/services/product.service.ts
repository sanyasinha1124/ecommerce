// ─── product.service.ts ───────────────────────────────────────────────────
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product, ProductPage, ProductType } from '../models/models';

export interface ProductQuery {
  keyword?: string; typeId?: number; categoryId?: number;
  subCategoryId?: number; minPrice?: number; maxPrice?: number;
  inStockOnly?: boolean; page?: number; limit?: number;
}

@Injectable({ providedIn: 'root' })
export class ProductService {
  private API = '/api/products';
  constructor(private http: HttpClient) { }

  getTaxonomy(): Observable<ProductType[]> {
    return this.http.get<ProductType[]>(`${this.API}/taxonomy`);
  }

  getProducts(query: ProductQuery = {}): Observable<ProductPage> {
    return this.http.get<ProductPage>(this.API, {
      params: this.toParams(query), // You need this to send the filters!
      withCredentials: true
    });
  }
  // getProducts(query: ProductQuery = {}): Observable<ProductPage> {
  //   return this.http.get<ProductPage>(this.API, { withCredentials: true});
  // }

  search(query: ProductQuery): Observable<ProductPage> {
    return this.http.get<ProductPage>(`${this.API}/search`, { params: this.toParams(query) });
  }

  getOne(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.API}/${id}`);
  }

  private toParams(q: ProductQuery): HttpParams {
    let p = new HttpParams();
    Object.entries(q).forEach(([k, v]) => { if (v !== undefined && v !== '' && v !== null) p = p.set(k, String(v)); });
    return p;
  }
}
