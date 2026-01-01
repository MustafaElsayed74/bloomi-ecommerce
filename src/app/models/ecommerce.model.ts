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
