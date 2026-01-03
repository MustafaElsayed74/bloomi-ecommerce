export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    category: string;
    imageUrl: string;
    stock: number;
    rating: number;
    createdAt?: Date;
}

export interface CartItem {
    id?: number;
    productId: number;
    product?: Product;
    quantity: number;
    cartSessionId?: string;
}

export interface Order {
    id?: number;
    customerName: string;
    customerEmail: string;
    shippingAddress: string;
    totalAmount: number;
    discountAmount?: number;
    appliedCouponCode?: string;
    status?: string;
    items: OrderItem[];
    createdAt?: Date;
}

export interface OrderItem {
    id?: number;
    orderId?: number;
    productId: number;
    productName: string;
    price: number;
    quantity: number;
}

export enum DiscountType {
    Percentage = 0,
    FixedAmount = 1
}

export interface Coupon {
    id: number;
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    expirationDate?: Date;
    maxUsageCount?: number;
    usageCount: number;
    isActive: boolean;
    createdAt: Date;
    createdByUserId: number;
}

export interface CouponValidationResult {
    isValid: boolean;
    message: string;
    discountAmount: number;
    coupon?: Coupon;
}

export interface CreateCouponRequest {
    code: string;
    description: string;
    discountType: DiscountType;
    discountValue: number;
    minimumOrderAmount?: number;
    maximumDiscountAmount?: number;
    expirationDate?: Date;
    maxUsageCount?: number;
}

