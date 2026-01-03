import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';
import { WishlistService } from '../../services/wishlist';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  cartItemCount = 0;
  wishlistItemCount = 0;
  isAuthenticated$;
  currentUser$;
  isAdmin = false;
  searchTerm = '';
  private searchDebounce: any;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
    private wishlistService: WishlistService,
    private router: Router
  ) {
    this.isAuthenticated$ = this.authService.isAuthenticated$;
    this.currentUser$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe(items => {
      this.cartItemCount = this.cartService.getCartItemCount();
    });

    // Check if user is admin by decoding JWT token
    const token = localStorage.getItem('authToken');
    if (token) {
      this.isAdmin = this.decodeAndCheckIsAdmin(token);
      console.log('[Header] isAdmin:', this.isAdmin);
    }

    // Load wishlist count for authenticated users
    this.authService.currentUser$.subscribe(user => {
      if (user?.id) {
        this.loadWishlistCount(user.id);
      } else {
        this.wishlistItemCount = 0;
      }
    });
  }

  loadWishlistCount(userId: number): void {
    this.wishlistService.getWishlist(userId).subscribe(items => {
      this.wishlistItemCount = items.length;
    });
  }

  private decodeAndCheckIsAdmin(token: string): boolean {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      console.log('[Header] Decoded token:', decoded);
      return decoded.IsAdmin === 'True' || decoded.IsAdmin === 'true' || decoded.IsAdmin === true || decoded.IsAdmin === 1;
    } catch (error) {
      console.error('Error decoding token:', error);
      return false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  onSearch(): void {
    this.triggerSearch(this.searchTerm);
  }

  onSearchTermChange(value: string): void {
    clearTimeout(this.searchDebounce);
    this.searchDebounce = setTimeout(() => this.triggerSearch(value), 300);
  }

  private triggerSearch(value: string): void {
    const term = (value || '').trim();
    if (!term) {
      this.router.navigate(['/products']);
      return;
    }
    this.router.navigate(['/products'], { queryParams: { search: term } });
  }
}

