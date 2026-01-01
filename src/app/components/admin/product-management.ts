import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin';

@Component({
    selector: 'app-product-management',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
    templateUrl: './product-management.html',
    styleUrls: ['./product-management.css']
})
export class ProductManagementComponent implements OnInit {
    products: any[] = [];
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    showForm = false;
    isEditing = false;
    editingId: number | null = null;

    productForm: FormGroup;

    searchTerm = '';
    filteredProducts: any[] = [];

    constructor(
        private adminService: AdminService,
        private fb: FormBuilder
    ) {
        this.productForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            price: ['', [Validators.required, Validators.min(0.01)]],
            category: ['', Validators.required],
            imageUrl: ['', Validators.required],
            stockQuantity: ['', [Validators.required, Validators.min(0)]]
        });
    }

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        console.log('[ProductManagement] Loading products');
        this.isLoading = true;
        this.errorMessage = '';

        this.adminService.getAllProducts().subscribe(
            (data) => {
                console.log('[ProductManagement] Products loaded', data);
                this.products = data;
                this.filteredProducts = data;
                this.isLoading = false;
            },
            (error) => {
                console.error('[ProductManagement] Error loading products', error);
                this.errorMessage = 'Failed to load products';
                this.isLoading = false;
            }
        );
    }

    openAddForm(): void {
        console.log('[ProductManagement] Opening add form');
        this.showForm = true;
        this.isEditing = false;
        this.editingId = null;
        this.productForm.reset();
    }

    editProduct(product: any): void {
        console.log('[ProductManagement] Editing product', product.id);
        this.showForm = true;
        this.isEditing = true;
        this.editingId = product.id;
        this.productForm.patchValue(product);
    }

    saveProduct(): void {
        if (!this.productForm.valid) {
            this.errorMessage = 'Please fill all required fields';
            return;
        }

        const formData = this.productForm.value;

        if (this.isEditing && this.editingId) {
            console.log('[ProductManagement] Updating product', this.editingId);
            this.adminService.updateProduct(this.editingId, formData).subscribe(
                (response) => {
                    console.log('[ProductManagement] Product updated', response);
                    this.successMessage = 'Product updated successfully';
                    this.closeForm();
                    this.loadProducts();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                (error) => {
                    console.error('[ProductManagement] Error updating product', error);
                    this.errorMessage = 'Failed to update product';
                }
            );
        } else {
            console.log('[ProductManagement] Creating product');
            this.adminService.createProduct(formData).subscribe(
                (response) => {
                    console.log('[ProductManagement] Product created', response);
                    this.successMessage = 'Product created successfully';
                    this.closeForm();
                    this.loadProducts();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                (error) => {
                    console.error('[ProductManagement] Error creating product', error);
                    this.errorMessage = 'Failed to create product';
                }
            );
        }
    }

    deleteProduct(id: number): void {
        if (confirm('Are you sure you want to delete this product?')) {
            console.log('[ProductManagement] Deleting product', id);
            this.adminService.deleteProduct(id).subscribe(
                (response) => {
                    console.log('[ProductManagement] Product deleted', response);
                    this.successMessage = 'Product deleted successfully';
                    this.loadProducts();
                    setTimeout(() => this.successMessage = '', 3000);
                },
                (error) => {
                    console.error('[ProductManagement] Error deleting product', error);
                    this.errorMessage = 'Failed to delete product';
                }
            );
        }
    }

    closeForm(): void {
        console.log('[ProductManagement] Closing form');
        this.showForm = false;
        this.isEditing = false;
        this.editingId = null;
        this.productForm.reset();
    }

    searchProducts(): void {
        console.log('[ProductManagement] Searching products', this.searchTerm);
        const term = this.searchTerm.toLowerCase();
        this.filteredProducts = this.products.filter(product =>
            product.name.toLowerCase().includes(term) ||
            product.description.toLowerCase().includes(term) ||
            product.category.toLowerCase().includes(term)
        );
    }
}

