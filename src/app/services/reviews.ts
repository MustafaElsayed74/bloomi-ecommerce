import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../models/ecommerce.model';

export interface Review {
    id: number;
    productId: number;
    userId: number;
    orderId: number;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
    helpfulCount: number;
}

@Injectable({ providedIn: 'root' })
export class ReviewsService {
    private apiUrl = `${environment.apiUrl}/reviews`;

    constructor(private http: HttpClient) { }

    getByProduct(productId: number): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}/product/${productId}`);
    }

    add(review: Partial<Review>): Observable<Review> {
        return this.http.post<Review>(this.apiUrl, review);
    }
}
