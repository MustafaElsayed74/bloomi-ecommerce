import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { Product } from '../../models/ecommerce.model';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {
  product: Product | null = null;
  quantity = 1;
  loading = true;
  successMessage = '';
  errorMessage = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        this.loadProduct(parseInt(id));
      }
    });
  }

  loadProduct(id: number): void {
    this.productService.getProduct(id).subscribe(
      (data) => {
        this.product = data;
        this.loading = false;
      },
      (error) => {
        console.error('Error loading product:', error);
        this.loading = false;
      }
    );
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart({
        productId: this.product.id,
        quantity: this.quantity,
        product: this.product
      }).subscribe(
        (item) => {
          this.successMessage = `${this.product?.name} added to cart!`;
          this.cartService.loadCart();
          this.quantity = 1;
          setTimeout(() => this.successMessage = '', 5000);
        },
        (error) => {
          console.error('Error adding to cart:', error);
          this.errorMessage = 'Failed to add to cart';
          setTimeout(() => this.errorMessage = '', 5000);
        }
      );
    }
  }

  decreaseQuantity(): void {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity(): void {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }
}

