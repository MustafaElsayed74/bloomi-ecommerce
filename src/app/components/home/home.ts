import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProductService } from '../../services/product';
import { Product } from '../../models/ecommerce.model';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './home.html',
    styleUrl: './home.css'
})
export class HomeComponent implements OnInit {
    trendingProducts: Product[] = [];
    newArrivals: Product[] = [];
    categories: string[] = [];
    categoryShowcase: any[] = [];
    loading = true;

    valuePropositions = [
        {
            icon: '🎁',
            title: 'SPECIAL OFFERS',
            description: 'Exclusive bundles and seasonal discounts on premium products'
        },
        {
            icon: '✨',
            title: 'QUALITY GUARANTEED',
            description: 'Authentic, dermatologist-tested skincare from trusted brands'
        },
        {
            icon: '🚚',
            title: 'FREE SHIPPING',
            description: 'Free delivery on orders over EGP 300 nationwide'
        }
    ];

    constructor(private productService: ProductService) { }

    ngOnInit(): void {
        this.loadCategories();
        this.loadTrendingProducts();
    }

    loadCategories(): void {
        this.productService.getCategories().subscribe(
            (data) => {
                this.categories = data;
                this.loadCategoryShowcase(data);
            },
            (error) => console.error('Failed to load categories:', error)
        );
    }

    loadCategoryShowcase(categories: string[]): void {
        this.categoryShowcase = [];
        categories.forEach((category) => {
            this.productService.getProductsByCategory(category, 'rating-desc').subscribe(
                (data) => {
                    if (data.length > 0) {
                        this.categoryShowcase.push({
                            name: category,
                            image: data[0].imageUrl,
                            description: data[0].description
                        });
                    }
                },
                (error) => console.error(`Failed to load products for ${category}:`, error)
            );
        });
    }

    loadTrendingProducts(): void {
        this.loading = true;
        this.productService.getProducts('rating-desc').subscribe(
            (data) => {
                this.trendingProducts = data.slice(0, 12);
                this.newArrivals = data.sort((a, b) =>
                    new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
                ).slice(0, 6);
                this.loading = false;
            },
            (error) => {
                console.error('Failed to load products:', error);
                this.loading = false;
            }
        );
    }
}
