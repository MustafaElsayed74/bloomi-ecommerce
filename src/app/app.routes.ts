import { Routes } from '@angular/router';
import { ProductList } from './components/product-list/product-list';
import { ProductDetail } from './components/product-detail/product-detail';
import { ShoppingCart } from './components/shopping-cart/shopping-cart';
import { Checkout } from './components/checkout/checkout';
import { LoginComponent } from './components/login/login';
import { AuthGuard } from './services/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: '/products', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'products', component: ProductList },
    { path: 'product/:id', component: ProductDetail },
    { path: 'cart', component: ShoppingCart },
    { path: 'checkout', component: Checkout, canActivate: [AuthGuard] },
    { path: '**', redirectTo: '/products' }
];
