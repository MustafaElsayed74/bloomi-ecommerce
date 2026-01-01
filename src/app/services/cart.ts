import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { CartItem } from '../models/ecommerce.model';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'https://localhost:7147/api/cart';
  private sessionId = this.getOrCreateSessionId();
  private cartSubject = new BehaviorSubject<CartItem[]>([]);

  constructor(private http: HttpClient) {
    this.loadCart();
  }

  private getOrCreateSessionId(): string {
    const stored = localStorage.getItem('cartSessionId');
    if (stored) {
      return stored;
    }
    const newId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('cartSessionId', newId);
    return newId;
  }

  getCart(): Observable<CartItem[]> {
    return this.cartSubject.asObservable();
  }

  loadCart(): void {
    this.http.get<CartItem[]>(`${this.apiUrl}/${this.sessionId}`).subscribe(
      (items) => this.cartSubject.next(items),
      (error) => console.log('Cart not found, starting fresh')
    );
  }

  addToCart(cartItem: CartItem): Observable<CartItem> {
    cartItem.cartSessionId = this.sessionId;
    return this.http.post<CartItem>(this.apiUrl, cartItem);
  }

  updateQuantity(id: number, cartItem: CartItem): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, cartItem);
  }

  removeFromCart(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  clearCart(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear/${this.sessionId}`);
  }

  getCartTotal(): number {
    const items = this.cartSubject.value;
    return items.reduce((total, item) => total + ((item.product?.price || 0) * item.quantity), 0);
  }

  getCartItemCount(): number {
    const items = this.cartSubject.value;
    return items.reduce((count, item) => count + item.quantity, 0);
  }
}
