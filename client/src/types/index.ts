export type UserRole = "customer" | "admin" | "delivery";

export interface User {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    addresses: Address[];
    role: UserRole;
    isAdmin?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Review {
    _id: string;
    product: string;
    userName: string;
    rating: number;
    comment: string;
    createdAt: string;
}

export interface Notification {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

export interface Address {
    _id: string;
    label: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
    lat: number;
    lng: number;
}

export interface Category {
    slug: string;
    name: string;
    image: string;
}

export interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    originalPrice: number;
    image: string;
    category: string;
    unit: string;
    stock: number;
    isOrganic: boolean;
    rating: number;
    reviewCount: number;
    discount: number;
    createdAt: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
}

export interface OrderItem {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    unit: string;
}

export interface DeliveryPartner {
    _id: string;
    name: string;
    email: string;
    phone: string;
    avatar: string;
    vehicleType: "bike" | "scooter" | "car";
    isActive: boolean;
    createdAt: string;
}

export interface Order {
    _id: string;
    orderNumber?: string | null;
    user: string | { _id: string; name: string; email: string; phone?: string };
    items: OrderItem[];
    shippingAddress: Omit<Address, "_id" | "isDefault">;
    paymentMethod: string;
    subtotal: number;
    deliveryFee: number;
    tax: number;
    total: number;
    status: string;
    statusHistory: { status: string; timestamp: string; note: string }[];
    deliveryPartner: DeliveryPartner | null;
    deliveryOtp: string;
    isPaid: boolean;
    createdAt: string;
}
