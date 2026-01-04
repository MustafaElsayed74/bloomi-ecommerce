import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '../../services/order';
import { AuthService } from '../../services/auth';
import { Order } from '../../models/ecommerce.model';

@Component({
    selector: 'app-order-history',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './order-history.html',
    styleUrl: './order-history.css',
})
export class OrderHistory implements OnInit {
    orders: Order[] = [];
    loading = true;
    errorMessage = '';

    constructor(
        private orderService: OrderService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        this.loadOrders();
    }

    loadOrders(): void {
        this.loading = true;
        this.errorMessage = '';

        this.orderService.getUserOrders().subscribe({
            next: (orders) => {
                this.orders = orders;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading orders:', error);
                this.errorMessage = 'Failed to load order history';
                this.loading = false;
            }
        });
    }

    getStatusClass(status?: string): string {
        if (!status) return 'status-pending';
        const statusLower = status.toLowerCase();
        switch (statusLower) {
            case 'pending': return 'status-pending';
            case 'processing': return 'status-processing';
            case 'shipped': return 'status-shipped';
            case 'delivered': return 'status-delivered';
            case 'cancelled': return 'status-cancelled';
            default: return 'status-pending';
        }
    }

    getStatusLabel(status?: string): string {
        if (!status) return 'Pending';
        return status.charAt(0).toUpperCase() + status.slice(1);
    }

    formatDate(dateString?: Date): string {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
}
