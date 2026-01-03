import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/ecommerce.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = `${environment.apiUrl}/products`;

  constructor(private http: HttpClient) { }

  getProducts(sortBy?: string): Observable<Product[]> {
    const url = sortBy ? `${this.apiUrl}?sortBy=${sortBy}` : this.apiUrl;
    return this.http.get<Product[]>(url);
  }

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  getProductsByCategory(category: string, sortBy?: string): Observable<Product[]> {
    const url = sortBy
      ? `${this.apiUrl}/category/${category}?sortBy=${sortBy}`
      : `${this.apiUrl}/category/${category}`;
    return this.http.get<Product[]>(url);
  }

  searchProducts(keyword: string, sortBy?: string): Observable<Product[]> {
    const url = sortBy
      ? `${this.apiUrl}/search?keyword=${keyword}&sortBy=${sortBy}`
      : `${this.apiUrl}/search?keyword=${keyword}`;
    return this.http.get<Product[]>(url);
  }

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  updateProduct(id: number, product: Product): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, product);
  }

  deleteProduct(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/categories`);
  }
}

