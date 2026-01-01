import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { Product } from '../../models/ecommerce.model';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products: Product[] = [];
  loading = true;
  error = '';

  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe(
      (data) => {
        this.products = data;
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load products';
        this.loading = false;
        console.error(error);
      }
    );
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      productId: product.id,
      quantity: 1,
      product: product
    }).subscribe(
      (item) => {
        alert(`${product.name} added to cart!`);
        this.cartService.loadCart();
      },
      (error) => {
        console.error('Error adding to cart:', error);
        alert('Failed to add to cart');
      }
    );
  }
}

