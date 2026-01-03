import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/ecommerce.model';

export interface WishlistItem {
    id: number;
    userId: number;
    productId: number;
    product?: Product;
    addedAt: string;
}

@Injectable({ providedIn: 'root' })
export class WishlistService {
    private apiUrl = 'http://localhost:5076/api/wishlist';

    constructor(private http: HttpClient) { }

    getWishlist(userId: number): Observable<WishlistItem[]> {
        return this.http.get<WishlistItem[]>(`${this.apiUrl}/user/${userId}`);
    }

    add(userId: number, productId: number): Observable<WishlistItem> {
        return this.http.post<WishlistItem>(this.apiUrl, { userId, productId });
    }

    remove(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
