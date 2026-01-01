import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

declare global {
    interface Window {
        google: any;
    }
}

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
    isLoading = false;
    errorMessage = '';

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit(): void {
        // Initialize Google Sign-In
        this.initGoogleSignIn();
    }

    private initGoogleSignIn(): void {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: 'YOUR_GOOGLE_CLIENT_ID', // Replace with your Google Client ID
                callback: (response: any) => this.handleGoogleLogin(response)
            });

            window.google.accounts.id.renderButton(
                document.getElementById('google-signin-button'),
                {
                    theme: 'outline',
                    size: 'large',
                    width: '300'
                }
            );
        } else {
            console.error('Google Sign-In SDK not loaded');
        }
    }

    private handleGoogleLogin(response: any): void {
        if (response.credential) {
            this.isLoading = true;
            this.errorMessage = '';

            this.authService.googleLogin(response.credential).subscribe({
                next: (res) => {
                    if (res.success) {
                        this.router.navigate(['/']);
                    } else {
                        this.errorMessage = res.message || 'Login failed';
                    }
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Login error:', error);
                    this.errorMessage = 'An error occurred during login. Please try again.';
                    this.isLoading = false;
                }
            });
        }
    }
}
