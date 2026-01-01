import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth';

@Injectable({
    providedIn: 'root'
})
export class AdminGuard implements CanActivate {
    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean {
        const user = this.authService.getCurrentUser();
        const token = this.authService.getToken();

        console.log('[AdminGuard] Checking admin access', { user, hasToken: !!token });

        if (!token) {
            console.log('[AdminGuard] No token found, redirecting to login');
            this.router.navigate(['/login']);
            return false;
        }

        if (!user) {
            console.log('[AdminGuard] No user data, redirecting to login');
            this.router.navigate(['/login']);
            return false;
        }

        // Check if user has admin privileges
        const decodedToken = this.decodeToken(token);
        const isAdmin = decodedToken?.IsAdmin === 'true' || decodedToken?.IsAdmin === 'True' || decodedToken?.IsAdmin === true || decodedToken?.IsAdmin === 1;

        console.log('[AdminGuard] Token decoded', { isAdmin, decodedToken });

        if (!isAdmin) {
            console.log('[AdminGuard] User is not admin, redirecting to home');
            this.router.navigate(['/']);
            return false;
        }

        console.log('[AdminGuard] Admin access granted');
        return true;
    }

    private decodeToken(token: string): any {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        } catch (e) {
            console.error('[AdminGuard] Error decoding token', e);
            return null;
        }
    }
}

