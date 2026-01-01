import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin';

interface User {
    id: string;
    email: string;
    name: string;
    createdAt: string;
    lastLogin?: string;
    orderCount?: number;
}

@Component({
    selector: 'app-user-management',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './user-management.html',
    styleUrls: ['./user-management.css']
})
export class UserManagementComponent implements OnInit {
    users: User[] = [];
    filteredUsers: User[] = [];
    isLoading = false;
    errorMessage = '';
    successMessage = '';
    searchTerm = '';
    selectedUser: User | null = null;
    showUserDetails = false;

    constructor(private adminService: AdminService) {
        console.log('[UserManagementComponent] Constructor called');
    }

    ngOnInit(): void {
        console.log('[UserManagementComponent] ngOnInit - loading users');
        this.loadUsers();
    }

    loadUsers(): void {
        console.log('[UserManagementComponent] loadUsers - fetching all users');
        this.isLoading = true;
        this.errorMessage = '';

        this.adminService.getAllUsers().subscribe({
            next: (data) => {
                console.log('[UserManagementComponent] loadUsers - success:', data);
                this.users = data || [];
                this.filteredUsers = [...this.users];
                this.isLoading = false;
                this.dismissMessageAfterDelay();
            },
            error: (error) => {
                console.error('[UserManagementComponent] loadUsers - error:', error);
                this.errorMessage = 'Failed to load users. Please try again.';
                this.isLoading = false;
                this.dismissMessageAfterDelay();
            }
        });
    }

    searchUsers(): void {
        console.log('[UserManagementComponent] searchUsers with term:', this.searchTerm);
        const term = this.searchTerm.toLowerCase().trim();

        if (!term) {
            this.filteredUsers = [...this.users];
        } else {
            this.filteredUsers = this.users.filter(user =>
                user.email.toLowerCase().includes(term) ||
                user.name.toLowerCase().includes(term)
            );
        }
        console.log('[UserManagementComponent] searchUsers - found', this.filteredUsers.length, 'users');
    }

    viewUserDetails(user: User): void {
        console.log('[UserManagementComponent] viewUserDetails:', user.id);
        this.selectedUser = { ...user };
        this.showUserDetails = true;
    }

    closeUserDetails(): void {
        console.log('[UserManagementComponent] closeUserDetails');
        this.selectedUser = null;
        this.showUserDetails = false;
    }

    deleteUser(userId: string | number): void {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const confirmed = confirm(`Are you sure you want to delete user "${user.email}"? This action cannot be undone.`);
        if (!confirmed) {
            console.log('[UserManagementComponent] deleteUser - cancelled by user');
            return;
        }

        console.log('[UserManagementComponent] deleteUser - deleting user:', userId);
        this.isLoading = true;
        this.errorMessage = '';

        const numericId = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        this.adminService.deleteUser(numericId).subscribe({
            next: () => {
                console.log('[UserManagementComponent] deleteUser - success');
                this.successMessage = `User "${user.email}" has been deleted successfully`;
                this.users = this.users.filter(u => u.id !== userId);
                this.searchUsers(); // Re-filter the list
                this.isLoading = false;
                this.closeUserDetails();
                this.dismissMessageAfterDelay();
            },
            error: (error) => {
                console.error('[UserManagementComponent] deleteUser - error:', error);
                this.errorMessage = `Failed to delete user "${user.email}". Please try again.`;
                this.isLoading = false;
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

    getInitials(name: string): string {
        return name
            .split(' ')
            .map(n => n.charAt(0).toUpperCase())
            .join('')
            .substring(0, 2) || '?';
    }

    formatDate(dateString: string | undefined): string {
        if (!dateString) return 'Never';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    getAccountAge(createdAt: string): string {
        const created = new Date(createdAt);
        const now = new Date();
        const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Today';
        if (days === 1) return '1 day ago';
        if (days < 30) return `${days} days ago`;
        if (days < 365) {
            const months = Math.floor(days / 30);
            return `${months} month${months > 1 ? 's' : ''} ago`;
        }
        const years = Math.floor(days / 365);
        return `${years} year${years > 1 ? 's' : ''} ago`;
    }
}

