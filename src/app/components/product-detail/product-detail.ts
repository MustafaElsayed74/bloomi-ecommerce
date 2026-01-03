import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product';
import { CartService } from '../../services/cart';
import { Product } from '../../models/ecommerce.model';
import { ReviewsService, Review } from '../../services/reviews';
import { WishlistService, WishlistItem } from '../../services/wishlist';
import { AuthService } from '../../services/auth';

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
  Math = Math; // Expose Math for template

  // Reviews
  reviews: Review[] = [];
  reviewsLoading = false;
  showReviewForm = false;
  newReview = {
    rating: 5,
    title: '',
    comment: ''
  };

  // Wishlist
  isInWishlist = false;
  wishlistItem: WishlistItem | null = null;
  userId: number | null = null;
  canReview = false;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private reviewsService: ReviewsService,
    private wishlistService: WishlistService,
    private authService: AuthService,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userId = user?.id ?? null;

    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id) {
        const productId = parseInt(id);
        this.loadProduct(productId);
        this.loadReviews(productId);
        if (this.userId) {
          this.loadWishlistStatus(productId);
        }
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

  loadReviews(productId: number): void {
    this.reviewsLoading = true;
    this.reviewsService.getByProduct(productId).subscribe({
      next: (reviews) => {
        this.reviews = reviews;
        this.reviewsLoading = false;
        this.checkCanReview();
      },
      error: (err) => {
        console.error('Error loading reviews:', err);
        this.reviewsLoading = false;
      }
    });
  }

  checkCanReview(): void {
    // User can review if logged in and hasn't reviewed yet
    if (this.userId && this.reviews.every(r => r.userId !== this.userId)) {
      this.canReview = true;
    }
  }

  submitReview(): void {
    if (!this.userId || !this.product) {
      this.errorMessage = 'Please login to submit a review';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (!this.newReview.title.trim() || !this.newReview.comment.trim()) {
      this.errorMessage = 'Please fill in all review fields';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    this.reviewsService.add({
      productId: this.product.id,
      userId: this.userId,
      orderId: 0, // Backend will validate this
      rating: this.newReview.rating,
      title: this.newReview.title,
      comment: this.newReview.comment
    }).subscribe({
      next: (review) => {
        this.reviews.unshift(review);
        this.successMessage = 'Review submitted successfully!';
        this.showReviewForm = false;
        this.newReview = { rating: 5, title: '', comment: '' };
        this.canReview = false;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (err) => {
        console.error('Error submitting review:', err);
        this.errorMessage = err.error?.message || 'Failed to submit review. You must have purchased this product.';
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
  }

  loadWishlistStatus(productId: number): void {
    if (!this.userId) return;

    this.wishlistService.getWishlist(this.userId).subscribe({
      next: (items) => {
        const item = items.find(w => w.productId === productId);
        this.isInWishlist = !!item;
        this.wishlistItem = item || null;
      },
      error: (err) => console.error('Error loading wishlist status:', err)
    });
  }

  toggleWishlist(): void {
    if (!this.userId || !this.product) {
      this.errorMessage = 'Please login to use wishlist';
      setTimeout(() => this.errorMessage = '', 3000);
      return;
    }

    if (this.isInWishlist && this.wishlistItem) {
      this.wishlistService.remove(this.wishlistItem.id).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.wishlistItem = null;
          this.successMessage = 'Removed from wishlist';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          console.error('Error removing from wishlist:', err);
          this.errorMessage = 'Failed to remove from wishlist';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    } else {
      this.wishlistService.add(this.userId, this.product.id).subscribe({
        next: (item) => {
          this.isInWishlist = true;
          this.wishlistItem = item;
          this.successMessage = 'Added to wishlist';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (err) => {
          console.error('Error adding to wishlist:', err);
          this.errorMessage = 'Failed to add to wishlist';
          setTimeout(() => this.errorMessage = '', 3000);
        }
      });
    }
  }

  getStarArray(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < rating ? 1 : 0);
  }
}

