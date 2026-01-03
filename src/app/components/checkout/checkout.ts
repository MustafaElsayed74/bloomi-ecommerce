import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { OrderService } from '../../services/order';
import { StripeService, CheckoutItem } from '../../services/stripe';
import { AuthService, UserDto } from '../../services/auth';
import { CouponService } from '../../services/coupon';
import { Order, OrderItem, CartItem, CouponValidationResult } from '../../models/ecommerce.model';

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
  discount = 0;
  finalTotal = 0;
  loading = false;
  paymentLoading = false;
  couponLoading = false;
  currentUser: UserDto | null = null;
  useNewAddress = false;
  couponCode = '';
  appliedCoupon: CouponValidationResult | null = null;
  couponMessage = '';
  couponError = '';

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
    private authService: AuthService,
    private couponService: CouponService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadCart();
    this.loadUserData();
  }

  loadUserData(): void {
    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.currentUser = user;
        this.order.customerName = user.name;
        this.order.customerEmail = user.email;
        // Use the user's saved address as default if available
        if (user.address) {
          this.order.shippingAddress = user.address;
          this.useNewAddress = false;  // Primary address is selected by default
        } else {
          this.useNewAddress = true;  // No saved address, so show new address input
        }
      }
    });
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
    this.finalTotal = this.total - this.discount;
    this.order.totalAmount = this.finalTotal;
  }

  applyCoupon(): void {
    if (!this.couponCode.trim()) {
      this.couponError = 'Please enter a coupon code';
      setTimeout(() => this.couponError = '', 3000);
      return;
    }

    this.couponLoading = true;
    this.couponError = '';
    this.couponMessage = '';

    this.couponService.validateCoupon(this.couponCode.trim(), this.total).subscribe({
      next: (result) => {
        this.couponLoading = false;
        if (result.isValid) {
          this.appliedCoupon = result;
          this.discount = result.discountAmount;
          this.couponMessage = result.message;
          this.calculateTotal();
          setTimeout(() => this.couponMessage = '', 5000);
        } else {
          this.couponError = result.message;
          setTimeout(() => this.couponError = '', 5000);
        }
      },
      error: (error) => {
        this.couponLoading = false;
        this.couponError = 'Failed to validate coupon';
        setTimeout(() => this.couponError = '', 5000);
        console.error(error);
      }
    });
  }

  removeCoupon(): void {
    this.appliedCoupon = null;
    this.discount = 0;
    this.couponCode = '';
    this.couponMessage = '';
    this.couponError = '';
    this.calculateTotal();
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

    // Add coupon information to order
    if (this.appliedCoupon?.isValid) {
      this.order.discountAmount = this.discount;
      this.order.appliedCouponCode = this.couponCode.trim();
    }

    this.orderService.createOrder(this.order).subscribe(
      (createdOrder) => {
        // Increment coupon usage if applied
        if (this.appliedCoupon?.isValid && this.couponCode) {
          this.couponService.incrementUsage(this.couponCode.trim()).subscribe();
        }

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

