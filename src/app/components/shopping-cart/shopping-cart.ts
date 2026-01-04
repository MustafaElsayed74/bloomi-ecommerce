import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { CartItem } from '../../models/ecommerce.model';

@Component({
  selector: 'app-shopping-cart',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './shopping-cart.html',
  styleUrl: './shopping-cart.css',
})
export class ShoppingCart implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;

  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.loadCart();
  }

  loadCart(): void {
    this.cartService.getCart().subscribe(
      (items) => {
        this.cartItems = items;
        this.calculateTotal();
      }
    );
  }

  calculateTotal(): void {
    this.total = this.cartItems.reduce(
      (sum, item) => sum + ((item.product?.price || 0) * item.quantity),
      0
    );
  }

  updateQuantity(item: CartItem, quantity: number): void {
    if (quantity > 0 && item.id) {
      this.cartService.updateQuantity(item.id, { ...item, quantity }).subscribe(
        () => this.loadCart()
      );
    }
  }

  removeItem(id: number | undefined): void {
    if (id) {
      console.log('[ShoppingCart] Removing item with id:', id);
      this.cartService.removeFromCart(id).subscribe({
        next: () => {
          console.log('[ShoppingCart] Item removed successfully');
        },
        error: (err) => {
          console.error('[ShoppingCart] Error removing item:', err);
        }
      });
    }
  }

  checkout(): void {
    // Navigate to checkout
  }
}

