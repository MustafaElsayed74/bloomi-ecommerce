import { Injectable } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    console.log('[AuthInterceptor] Intercepting request to:', req.url);
    console.log('[AuthInterceptor] Token:', token ? 'Present' : 'Missing');

    if (token) {
        console.log('[AuthInterceptor] Adding Authorization header');
        req = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(req);
};


