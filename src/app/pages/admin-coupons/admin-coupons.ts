import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CouponService } from '../../services/coupon';
import { Coupon, CreateCouponRequest, DiscountType } from '../../models/ecommerce.model';

@Component({
    selector: 'app-admin-coupons',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './admin-coupons.html',
    styleUrl: './admin-coupons.css'
})
export class AdminCoupons implements OnInit {
    coupons: Coupon[] = [];
    loading = false;
    showCreateForm = false;
    editingCoupon: Coupon | null = null;
    successMessage = '';
    errorMessage = '';

    DiscountType = DiscountType;

    newCoupon: CreateCouponRequest = {
        code: '',
        description: '',
        discountType: DiscountType.Percentage,
        discountValue: 0,
        minimumOrderAmount: undefined,
        maximumDiscountAmount: undefined,
        expirationDate: undefined,
        maxUsageCount: undefined
    };

    constructor(private couponService: CouponService) { }

    ngOnInit(): void {
        this.loadCoupons();
    }

    loadCoupons(): void {
        this.loading = true;
        this.couponService.getAllCoupons().subscribe({
            next: (coupons) => {
                this.coupons = coupons;
                this.loading = false;
            },
            error: (error) => {
                console.error('Error loading coupons:', error);
                this.errorMessage = 'Failed to load coupons';
                this.loading = false;
            }
        });
    }

    openCreateForm(): void {
        this.showCreateForm = true;
        this.editingCoupon = null;
        this.resetForm();
    }

    openEditForm(coupon: Coupon): void {
        this.editingCoupon = coupon;
        this.showCreateForm = true;
        this.newCoupon = {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minimumOrderAmount: coupon.minimumOrderAmount,
            maximumDiscountAmount: coupon.maximumDiscountAmount,
            expirationDate: coupon.expirationDate,
            maxUsageCount: coupon.maxUsageCount
        };
    }

    closeForm(): void {
        this.showCreateForm = false;
        this.editingCoupon = null;
        this.resetForm();
    }

    resetForm(): void {
        this.newCoupon = {
            code: '',
            description: '',
            discountType: DiscountType.Percentage,
            discountValue: 0,
            minimumOrderAmount: undefined,
            maximumDiscountAmount: undefined,
            expirationDate: undefined,
            maxUsageCount: undefined
        };
    }

    saveCoupon(): void {
        if (this.editingCoupon) {
            this.updateCoupon();
        } else {
            this.createCoupon();
        }
    }

    createCoupon(): void {
        this.couponService.createCoupon(this.newCoupon).subscribe({
            next: (coupon) => {
                this.coupons.unshift(coupon);
                this.successMessage = 'Coupon created successfully!';
                this.closeForm();
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                console.error('Error creating coupon:', error);
                this.errorMessage = error.error?.message || 'Failed to create coupon';
                setTimeout(() => this.errorMessage = '', 5000);
            }
        });
    }

    updateCoupon(): void {
        if (!this.editingCoupon) return;

        const updateRequest = {
            ...this.newCoupon,
            isActive: this.editingCoupon.isActive
        };

        this.couponService.updateCoupon(this.editingCoupon.id, updateRequest).subscribe({
            next: () => {
                this.successMessage = 'Coupon updated successfully!';
                this.loadCoupons();
                this.closeForm();
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                console.error('Error updating coupon:', error);
                this.errorMessage = error.error?.message || 'Failed to update coupon';
                setTimeout(() => this.errorMessage = '', 5000);
            }
        });
    }

    toggleActive(coupon: Coupon): void {
        const updateRequest = {
            code: coupon.code,
            description: coupon.description,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minimumOrderAmount: coupon.minimumOrderAmount,
            maximumDiscountAmount: coupon.maximumDiscountAmount,
            expirationDate: coupon.expirationDate,
            maxUsageCount: coupon.maxUsageCount,
            isActive: !coupon.isActive
        };

        this.couponService.updateCoupon(coupon.id, updateRequest).subscribe({
            next: () => {
                coupon.isActive = !coupon.isActive;
                this.successMessage = `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully!`;
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                console.error('Error toggling coupon status:', error);
                this.errorMessage = 'Failed to update coupon status';
                setTimeout(() => this.errorMessage = '', 5000);
            }
        });
    }

    deleteCoupon(id: number): void {
        if (!confirm('Are you sure you want to delete this coupon?')) {
            return;
        }

        this.couponService.deleteCoupon(id).subscribe({
            next: () => {
                this.coupons = this.coupons.filter(c => c.id !== id);
                this.successMessage = 'Coupon deleted successfully!';
                setTimeout(() => this.successMessage = '', 3000);
            },
            error: (error) => {
                console.error('Error deleting coupon:', error);
                this.errorMessage = 'Failed to delete coupon';
                setTimeout(() => this.errorMessage = '', 5000);
            }
        });
    }

    getDiscountTypeDisplay(type: DiscountType): string {
        return type === DiscountType.Percentage ? 'Percentage' : 'Fixed Amount';
    }

    getDiscountDisplay(coupon: Coupon): string {
        if (coupon.discountType === DiscountType.Percentage) {
            return `${coupon.discountValue}%`;
        } else {
            return `EGP ${coupon.discountValue.toFixed(2)}`;
        }
    }

    isExpired(coupon: Coupon): boolean {
        if (!coupon.expirationDate) return false;
        return new Date(coupon.expirationDate) < new Date();
    }

    isUsageLimitReached(coupon: Coupon): boolean {
        if (!coupon.maxUsageCount) return false;
        return coupon.usageCount >= coupon.maxUsageCount;
    }
}
