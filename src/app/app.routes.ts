import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home';
import { ProductList } from './components/product-list/product-list';
import { ProductDetail } from './components/product-detail/product-detail';
import { ShoppingCart } from './components/shopping-cart/shopping-cart';
import { Checkout } from './components/checkout/checkout';
import { LoginComponent } from './components/login/login';
import { ProfileSettings } from './components/profile-settings/profile-settings';
import { OrderHistory } from './components/order-history/order-history';
import { AuthGuard } from './services/auth-guard';
import { AdminGuard } from './services/admin-guard';
import { AdminDashboardComponent } from './components/admin/admin-dashboard';
import { ProductManagementComponent } from './components/admin/product-management';
import { UserManagementComponent } from './components/admin/user-management';
import { OrderManagementComponent } from './components/admin/order-management';
import { VerifyEmailComponent } from './components/verify-email/verify-email';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password';
import { ResetPasswordComponent } from './components/reset-password/reset-password';
import { WishlistComponent } from './components/wishlist/wishlist';
import { AdminCoupons } from './pages/admin-coupons/admin-coupons';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'verify-email', component: VerifyEmailComponent },
    { path: 'forgot-password', component: ForgotPasswordComponent },
    { path: 'reset-password', component: ResetPasswordComponent },
    { path: 'products', component: ProductList },
    { path: 'product/:id', component: ProductDetail },
    { path: 'cart', component: ShoppingCart },
    { path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuard] },
    { path: 'checkout', component: Checkout, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileSettings, canActivate: [AuthGuard] },
    { path: 'orders', component: OrderHistory, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
    { path: 'admin/products', component: ProductManagementComponent, canActivate: [AdminGuard] },
    { path: 'admin/users', component: UserManagementComponent, canActivate: [AdminGuard] },
    { path: 'admin/orders', component: OrderManagementComponent, canActivate: [AdminGuard] },
    { path: 'admin/coupons', component: AdminCoupons, canActivate: [AdminGuard] },
    { path: '**', redirectTo: '' }
];

