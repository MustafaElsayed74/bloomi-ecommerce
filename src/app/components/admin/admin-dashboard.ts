import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminService } from '../../services/admin';

@Component({
    selector: 'app-admin-dashboard',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-dashboard.html',
    styleUrls: ['./admin-dashboard.css']
})
export class AdminDashboardComponent implements OnInit {
    stats: any = {
        totalProducts: 0,
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        recentOrders: []
    };

    activeTab = 'overview';
    isLoading = true;
    errorMessage = '';

    constructor(
        private adminService: AdminService,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.loadDashboardStats();
    }

    loadDashboardStats(): void {
        console.log('[AdminDashboard] Loading dashboard stats');
        this.isLoading = true;
        this.errorMessage = '';

        this.adminService.getDashboardStats().subscribe(
            (data) => {
                console.log('[AdminDashboard] Stats loaded', data);
                this.stats = data;
                this.isLoading = false;
            },
            (error) => {
                console.error('[AdminDashboard] Error loading stats', error);
                this.errorMessage = 'Failed to load dashboard statistics';
                this.isLoading = false;
            }
        );
    }

    setActiveTab(tab: string): void {
        console.log('[AdminDashboard] Switching to tab', tab);
        this.activeTab = tab;
    }

    navigateToProducts(): void {
        console.log('[AdminDashboard] Navigating to products');
        this.router.navigate(['/admin/products']);
    }

    navigateToUsers(): void {
        console.log('[AdminDashboard] Navigating to users');
        this.router.navigate(['/admin/users']);
    }

    navigateToOrders(): void {
        console.log('[AdminDashboard] Navigating to orders');
        this.router.navigate(['/admin/orders']);
    }
}

