import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { loadStripe } from '@stripe/stripe-js';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class StripeService {
    private apiUrl = 'https://localhost:7147/api/payment';
    private publishableKey = 'pk_test_51SkfI3AWkBaIhrjmair8ojlK19MrbWTTbSwTy31YOU5XYJKLKLXcJqqxzYiVMMBWlDkPJKYEhC4Qc1Qe6JEseji400jYUOyGe9';

    constructor(private http: HttpClient) { }

    async getStripe() {
        return await loadStripe(this.publishableKey);
    }

    createPaymentIntent(amount: number): Observable<{ clientSecret: string }> {
        return this.http.post<{ clientSecret: string }>(
            `${this.apiUrl}/create-payment-intent`,
            amount
        );
    }

    createCheckoutSession(items: CheckoutItem[], successUrl: string, cancelUrl: string): Observable<{ sessionId: string; url: string }> {
        return this.http.post<{ sessionId: string; url: string }>(
            `${this.apiUrl}/create-checkout-session`,
            {
                items,
                successUrl,
                cancelUrl,
            }
        );
    }
}

export interface CheckoutItem {
    name: string;
    price: number;
    quantity: number;
}
