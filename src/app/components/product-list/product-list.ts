import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { Product } from '../../models/ecommerce.model';
import { WishlistService, WishlistItem } from '../../services/wishlist';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css',
})
export class ProductList implements OnInit {
  products: Product[] = [];
  allProducts: Product[] = [];
  loading = true;
  error = '';
  successMessage = '';
  errorMessage = '';
  searchTerm = '';
  wishlist: WishlistItem[] = [];
  userId: number | null = null;
  sortBy: string = '';
  categories: string[] = [];
  selectedCategory: string = '';

  // Pagination properties
  currentPage: number = 1;
  pageSize: number = 12;
  totalItems: number = 0;
  totalPages: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router,
    private wishlistService: WishlistService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadCategories();

    this.route.queryParams.subscribe(params => {
      const search = params['search'] || '';
      const category = params['category'] || '';
      this.searchTerm = search;
      this.selectedCategory = category;
      this.loadProducts(search, category);
    });

    const user = this.authService.getCurrentUser();
    this.userId = user?.id ?? null;
    if (this.userId) {
      this.refreshWishlist();
    }
  }

  private refreshWishlist(): void {
    if (!this.userId) return;
    this.wishlistService.getWishlist(this.userId).subscribe(items => this.wishlist = items);
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe(
      (data) => this.categories = data,
      (error) => console.error('Failed to load categories:', error)
    );
  }

  loadProducts(search?: string, category?: string): void {
    const sortParam = this.sortBy || undefined;
    let source$;

    if (search && search.trim().length > 0) {
      source$ = this.productService.searchProducts(search.trim(), sortParam);
    } else if (category && category.trim().length > 0) {
      source$ = this.productService.getProductsByCategory(category.trim(), sortParam);
    } else {
      source$ = this.productService.getProducts(sortParam);
    }

    this.loading = true;

    source$.subscribe(
      (data) => {
        this.allProducts = data;
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.currentPage = 1; // Reset to first page on new search/filter
        this.updateDisplayedProducts();
        this.loading = false;
      },
      (error) => {
        this.error = 'Failed to load products';
        this.loading = false;
        console.error(error);
      }
    );
  }

  updateDisplayedProducts(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.products = this.allProducts.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.updateDisplayedProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  onCategoryChange(category: string): void {
    this.selectedCategory = category;
    this.searchTerm = '';
    this.loadProducts('', category);
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.sortBy = target.value;
    this.loadProducts(this.searchTerm, this.selectedCategory);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart({
      productId: product.id,
      quantity: 1,
      product: product
    }).subscribe(
      (item) => {
        this.successMessage = `${product.name} added to cart!`;
        this.cartService.loadCart();
        setTimeout(() => this.successMessage = '', 5000);
      },
      (error) => {
        console.error('Error adding to cart:', error);
        this.errorMessage = 'Failed to add to cart';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    );
  }

  isInWishlist(productId: number): boolean {
    return this.wishlist.some(w => w.productId === productId);
  }

  toggleWishlist(product: Product): void {
    if (!this.userId) {
      this.errorMessage = 'Please login to use wishlist';
      setTimeout(() => this.errorMessage = '', 4000);
      return;
    }
    const existing = this.wishlist.find(w => w.productId === product.id);
    if (existing) {
      this.wishlistService.remove(existing.id).subscribe(() => {
        this.wishlist = this.wishlist.filter(w => w.id !== existing.id);
      });
    } else {
      this.wishlistService.add(this.userId!, product.id).subscribe(item => {
        this.wishlist.push(item);
      });
    }
  }

  navigateToProduct(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  // Expose Math to template
  Math = Math;
}

