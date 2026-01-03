import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon, CouponValidationResult, CreateCouponRequest } from '../models/ecommerce.model';

@Injectable({
    providedIn: 'root'
})
export class CouponService {
    private apiUrl = 'http://localhost:5076/api/Coupons';

    constructor(private http: HttpClient) { }

    // Admin endpoints
    getAllCoupons(): Observable<Coupon[]> {
        return this.http.get<Coupon[]>(this.apiUrl);
    }

    getCoupon(id: number): Observable<Coupon> {
        return this.http.get<Coupon>(`${this.apiUrl}/${id}`);
    }

    createCoupon(request: CreateCouponRequest): Observable<Coupon> {
        return this.http.post<Coupon>(this.apiUrl, request);
    }

    updateCoupon(id: number, request: any): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, request);
    }

    deleteCoupon(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    // Public endpoint
    validateCoupon(code: string, orderAmount: number): Observable<CouponValidationResult> {
        return this.http.post<CouponValidationResult>(`${this.apiUrl}/validate`, {
            code,
            orderAmount
        });
    }

    incrementUsage(code: string): Observable<void> {
        return this.http.post<void>(`${this.apiUrl}/increment-usage`, { code });
    }
}
