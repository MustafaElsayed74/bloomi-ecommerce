import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { ProductDetail } from './components/product-detail/product-detail';
import { ShoppingCart } from './components/shopping-cart/shopping-cart';
import { Checkout } from './components/checkout/checkout';
import { LoginComponent } from './components/login/login';
import { ProfileSettings } from './components/profile-settings/profile-settings';
import { AuthGuard } from './services/auth-guard';
import { AdminGuard } from './services/admin-guard';
import { AdminDashboardComponent } from './components/admin/admin-dashboard';
import { ProductManagementComponent } from './components/admin/product-management';
import { UserManagementComponent } from './components/admin/user-management';
import { OrderManagementComponent } from './components/admin/order-management';

export const routes: Routes = [
    { path: '', redirectTo: '/products', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'products', component: ProductList },
    { path: 'product/:id', component: ProductDetail },
    { path: 'cart', component: ShoppingCart },
    { path: 'checkout', component: Checkout, canActivate: [AuthGuard] },
    { path: 'profile', component: ProfileSettings, canActivate: [AuthGuard] },
    { path: 'admin', component: AdminDashboardComponent, canActivate: [AdminGuard] },
    { path: 'admin/products', component: ProductManagementComponent, canActivate: [AdminGuard] },
    { path: 'admin/users', component: UserManagementComponent, canActivate: [AdminGuard] },
    { path: 'admin/orders', component: OrderManagementComponent, canActivate: [AdminGuard] },
    { path: '**', redirectTo: '/products' }
];

