import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private apiUrl = `${environment.apiUrl}/admin`;

    constructor(private http: HttpClient) { }

    // Dashboard
    getDashboardStats(): Observable<any> {
        console.log('[AdminService] Getting dashboard stats');
        return this.http.get<any>(`${this.apiUrl}/dashboard/stats`);
    }

    // Products
    getAllProducts(): Observable<any[]> {
        console.log('[AdminService] Getting all products');
        return this.http.get<any[]>(`${this.apiUrl}/products`);
    }

    getProduct(id: number): Observable<any> {
        console.log('[AdminService] Getting product', id);
        return this.http.get<any>(`${this.apiUrl}/products/${id}`);
    }

    createProduct(product: any): Observable<any> {
        console.log('[AdminService] Creating product', product);
        return this.http.post<any>(`${this.apiUrl}/products`, product);
    }

    updateProduct(id: number, product: any): Observable<any> {
        console.log('[AdminService] Updating product', id, product);
        return this.http.put<any>(`${this.apiUrl}/products/${id}`, product);
    }

    deleteProduct(id: number): Observable<any> {
        console.log('[AdminService] Deleting product', id);
        return this.http.delete<any>(`${this.apiUrl}/products/${id}`);
    }

    // Users
    getAllUsers(): Observable<any[]> {
        console.log('[AdminService] Getting all users');
        return this.http.get<any[]>(`${this.apiUrl}/users`);
    }

    getUser(id: number): Observable<any> {
        console.log('[AdminService] Getting user', id);
        return this.http.get<any>(`${this.apiUrl}/users/${id}`);
    }

    deleteUser(id: number): Observable<any> {
        console.log('[AdminService] Deleting user', id);
        return this.http.delete<any>(`${this.apiUrl}/users/${id}`);
    }

    // Orders
    getAllOrders(): Observable<any[]> {
        console.log('[AdminService] Getting all orders');
        return this.http.get<any[]>(`${this.apiUrl}/orders`);
    }

    getOrder(id: number): Observable<any> {
        console.log('[AdminService] Getting order', id);
        return this.http.get<any>(`${this.apiUrl}/orders/${id}`);
    }

    updateOrderStatus(id: number, status: string): Observable<any> {
        console.log('[AdminService] Updating order status', id, status);
        return this.http.put<any>(`${this.apiUrl}/orders/${id}/status`, { status });
    }
}

