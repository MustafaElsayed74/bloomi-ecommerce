import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { WishlistService, WishlistItem } from '../../services/wishlist';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-wishlist',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './wishlist.html',
    styleUrl: './wishlist.css',
})
export class WishlistComponent implements OnInit {
    wishlistItems: WishlistItem[] = [];
    loading = true;
    error = '';
    successMessage = '';
    errorMessage = '';
    userId: number | null = null;

    constructor(
        private wishlistService: WishlistService,
        private cartService: CartService,
        private authService: AuthService
    ) { }

    ngOnInit(): void {
        const user = this.authService.getCurrentUser();
        this.userId = user?.id ?? null;

        if (!this.userId) {
            this.error = 'Please login to view your wishlist';
            this.loading = false;
            return;
        }

        this.loadWishlist();
    }

    loadWishlist(): void {
        if (!this.userId) return;

        this.loading = true;
        this.wishlistService.getWishlist(this.userId).subscribe({
            next: (items) => {
                this.wishlistItems = items;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading wishlist:', err);
                this.error = 'Failed to load wishlist';
                this.loading = false;
            }
        });
    }

    removeFromWishlist(item: WishlistItem): void {
        this.wishlistService.remove(item.id).subscribe({
            next: () => {
                this.wishlistItems = this.wishlistItems.filter(w => w.id !== item.id);
                this.successMessage = 'Item removed from wishlist';
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => {
                console.error('Error removing from wishlist:', err);
                this.errorMessage = 'Failed to remove item';
                setTimeout(() => this.errorMessage = '', 3000);
            }
        });
    }

    addToCart(item: WishlistItem): void {
        if (!item.product) return;

        this.cartService.addToCart({
            productId: item.product.id,
            quantity: 1,
            product: item.product
        }).subscribe({
            next: () => {
                this.successMessage = `${item.product!.name} added to cart!`;
                this.cartService.loadCart();
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (err) => {
                console.error('Error adding to cart:', err);
                this.errorMessage = 'Failed to add to cart';
                setTimeout(() => this.errorMessage = '', 3000);
            }
        });
    }

    moveToCart(item: WishlistItem): void {
        this.addToCart(item);
        this.removeFromWishlist(item);
    }
}
