import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit {
  cartItemCount = 0;
  isAuthenticated$;
  currentUser$;
  isAdmin = false;

  constructor(
    private cartService: CartService,
    private authService: AuthService,
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
}

