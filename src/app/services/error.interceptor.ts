import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { LoggerService } from './logger.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const logger = inject(LoggerService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            let errorMessage = 'An unexpected error occurred';

            if (error.error instanceof ErrorEvent) {
                // Client-side error
                errorMessage = `Client Error: ${error.error.message}`;
                logger.error('Client-side error occurred', error.error);
            } else {
                // Server-side error
                errorMessage = error.error?.message || `Server Error: ${error.status} - ${error.statusText}`;
                logger.error(`Server error ${error.status}`, {
                    url: req.url,
                    status: error.status,
                    message: error.message
                });

                // Handle specific HTTP errors
                switch (error.status) {
                    case 401:
                        errorMessage = 'Unauthorized. Please login again.';
                        // Optionally redirect to login
                        break;
                    case 403:
                        errorMessage = 'You do not have permission to access this resource.';
                        break;
                    case 404:
                        errorMessage = 'The requested resource was not found.';
                        break;
                    case 500:
                        errorMessage = 'Internal server error. Please try again later.';
                        break;
                    case 503:
                        errorMessage = 'Service temporarily unavailable. Please try again later.';
                        break;
                }
            }

            return throwError(() => ({ message: errorMessage, originalError: error }));
        })
    );
};
