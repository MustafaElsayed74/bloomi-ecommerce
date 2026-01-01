import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';
import { StripeService, CheckoutItem } from '../../services/stripe';
import { Order, OrderItem, CartItem } from '../../models/ecommerce.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {
  cartItems: CartItem[] = [];
  total = 0;
  loading = false;
  paymentLoading = false;

  order: Order = {
    customerName: '',
    customerEmail: '',
    shippingAddress: '',
    totalAmount: 0,
    items: []
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private stripeService: StripeService,
    private router: Router
  ) { }

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
    this.order.totalAmount = this.total;
  }

  submitOrder(): void {
    if (!this.order.customerName || !this.order.customerEmail || !this.order.shippingAddress) {
      alert('Please fill in all required fields');
      return;
    }

    this.loading = true;
    this.order.items = this.cartItems.map(item => ({
      productId: item.productId,
      productName: item.product?.name || '',
      price: item.product?.price || 0,
      quantity: item.quantity
    } as OrderItem));

    this.orderService.createOrder(this.order).subscribe(
      (createdOrder) => {
        this.loading = false;
        alert('Order placed successfully!');
        this.cartService.clearCart().subscribe(() => {
          this.router.navigate(['/products']);
        });
      },
      (error) => {
        this.loading = false;
        alert('Failed to place order');
        console.error(error);
      }
    );
  }

  proceedToPayment(): void {
    if (!this.order.customerName || !this.order.customerEmail || !this.order.shippingAddress) {
      alert('Please fill in all required fields');
      return;
    }

    this.paymentLoading = true;
    const checkoutItems: CheckoutItem[] = this.cartItems.map(item => ({
      name: item.product?.name || 'Product',
      price: item.product?.price || 0,
      quantity: item.quantity,
    }));

    const baseUrl = window.location.origin;
    const successUrl = `${baseUrl}/cart?status=success`;
    const cancelUrl = `${baseUrl}/checkout`;

    this.stripeService.createCheckoutSession(checkoutItems, successUrl, cancelUrl).subscribe(
      (response) => {
        this.paymentLoading = false;
        if (response.url) {
          window.location.href = response.url;
        }
      },
      (error) => {
        this.paymentLoading = false;
        alert('Failed to initiate payment');
        console.error(error);
      }
    );
  }
}

