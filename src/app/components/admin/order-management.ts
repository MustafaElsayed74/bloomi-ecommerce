import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';

interface Order {
    id: string;
    orderNumber: string;
    userId?: string;
    totalAmount: number;
    status: string;
    createdAt: string;
    items?: any[];
    customerName?: string;
    customerEmail?: string;
    itemCount?: number;
}

@Component({
    selector: 'app-order-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './order-management.html',
    styleUrls: ['./order-management.css']
})
export class OrderManagementComponent implements OnInit {
    orders: Order[] = [];
    filteredOrders: Order[] = [];
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    searchTerm = '';
    statusFilter = 'all';
    selectedOrder: Order | null = null;
    showOrderDetails = false;
    updatingStatus = false;

    statusOptions = [
        { value: 'pending', label: 'Pending', color: 'amber' },
        { value: 'processing', label: 'Processing', color: 'blue' },
        { value: 'shipped', label: 'Shipped', color: 'purple' },
        { value: 'delivered', label: 'Delivered', color: 'green' },
        { value: 'cancelled', label: 'Cancelled', color: 'red' }
    ];

    constructor(private adminService: AdminService) {
        console.log('[OrderManagementComponent] Constructor called');
    }

    ngOnInit(): void {
        console.log('[OrderManagementComponent] ngOnInit - loading orders');
        this.loadOrders();
    }

    loadOrders(): void {
        console.log('[OrderManagementComponent] loadOrders - fetching all orders');
        this.isLoading = true;
        this.errorMessage = '';

        this.adminService.getAllOrders().subscribe({
            next: (data) => {
                console.log('[OrderManagementComponent] loadOrders - success:', data);
                this.orders = data || [];
                this.filterOrders();
                this.isLoading = false;
                this.dismissMessageAfterDelay();
            },
            error: (error) => {
                console.error('[OrderManagementComponent] loadOrders - error:', error);
                this.errorMessage = 'Failed to load orders. Please try again.';
                this.isLoading = false;
                this.dismissMessageAfterDelay();
            }
        });
    }

    searchOrders(): void {
        console.log('[OrderManagementComponent] searchOrders with term:', this.searchTerm);
        this.filterOrders();
    }

    onStatusFilterChange(): void {
        console.log('[OrderManagementComponent] onStatusFilterChange:', this.statusFilter);
        this.filterOrders();
    }

    private filterOrders(): void {
        let filtered = [...this.orders];

        // Apply search term
        if (this.searchTerm.trim()) {
            const term = this.searchTerm.toLowerCase().trim();
            filtered = filtered.filter(order =>
                order.orderNumber.toLowerCase().includes(term) ||
                (order.customerName && order.customerName.toLowerCase().includes(term)) ||
                (order.customerEmail && order.customerEmail.toLowerCase().includes(term))
            );
        }

        // Apply status filter
        if (this.statusFilter !== 'all') {
            filtered = filtered.filter(order => order.status === this.statusFilter);
        }

        this.filteredOrders = filtered;
        console.log('[OrderManagementComponent] filterOrders - found', this.filteredOrders.length, 'orders');
    }

    viewOrderDetails(order: Order): void {
        console.log('[OrderManagementComponent] viewOrderDetails:', order.id);
        this.isLoading = true;
        const orderId = typeof order.id === 'string' ? parseInt(order.id, 10) : order.id;

        this.adminService.getOrder(orderId).subscribe({
            next: (fullOrder) => {
                console.log('[OrderManagementComponent] Full order loaded:', fullOrder);
                this.selectedOrder = fullOrder;
                this.showOrderDetails = true;
                this.isLoading = false;
            },
            error: (error) => {
                console.error('[OrderManagementComponent] Error loading order details:', error);
                this.errorMessage = 'Failed to load order details';
                this.isLoading = false;
                this.dismissMessageAfterDelay();
            }
        });
    }

    closeOrderDetails(): void {
        console.log('[OrderManagementComponent] closeOrderDetails');
        this.selectedOrder = null;
        this.showOrderDetails = false;
    }

    updateOrderStatus(newStatus: string): void {
        if (!this.selectedOrder) return;

        console.log('[OrderManagementComponent] updateOrderStatus - from', this.selectedOrder.status, 'to', newStatus);
        this.updatingStatus = true;
        this.errorMessage = '';

        const orderId = typeof this.selectedOrder.id === 'string' ? parseInt(this.selectedOrder.id, 10) : this.selectedOrder.id;
        this.adminService.updateOrderStatus(orderId, newStatus).subscribe({
            next: () => {
                console.log('[OrderManagementComponent] updateOrderStatus - success');
                this.successMessage = `Order #${this.selectedOrder?.orderNumber} status updated to "${newStatus}"`;

                // Update local order
                const order = this.orders.find(o => o.id === this.selectedOrder?.id);
                if (order) {
                    order.status = newStatus;
                    if (this.selectedOrder) {
                        this.selectedOrder.status = newStatus;
                    }
                }

                this.filterOrders();
                this.updatingStatus = false;
                this.dismissMessageAfterDelay();
            },
            error: (error) => {
                console.error('[OrderManagementComponent] updateOrderStatus - error:', error);
                this.errorMessage = `Failed to update order status. Please try again.`;
                this.updatingStatus = false;
                this.dismissMessageAfterDelay();
            }
        });
    }

    private dismissMessageAfterDelay(): void {
        setTimeout(() => {
            this.successMessage = '';
            this.errorMessage = '';
        }, 3000);
    }

    getStatusColor(status: string): string {
        const option = this.statusOptions.find(s => s.value === status);
        return option ? option.color : 'gray';
    }

    getStatusLabel(status: string): string {
        const option = this.statusOptions.find(s => s.value === status);
        return option ? option.label : status;
    }

    formatDate(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    formatTime(dateString: string): string {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    canChangeStatus(currentStatus: string, newStatus: string): boolean {
        const order = ['pending', 'processing', 'shipped', 'delivered'];
        const cancelOnly = ['cancelled'];

        if (currentStatus === 'cancelled' || currentStatus === 'delivered') {
            return false;
        }

        if (newStatus === 'cancelled') {
            return currentStatus !== 'shipped' && currentStatus !== 'delivered';
        }

        const currentIndex = order.indexOf(currentStatus);
        const newIndex = order.indexOf(newStatus);
        return newIndex > currentIndex;
    }

    getAvailableStatuses(currentStatus: string): typeof this.statusOptions {
        return this.statusOptions.filter(status =>
            status.value === currentStatus || this.canChangeStatus(currentStatus, status.value)
        );
    }
}

