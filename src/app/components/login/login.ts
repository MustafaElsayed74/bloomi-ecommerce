import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    imports: [CommonModule, FormsModule],
    templateUrl: './login.html',
    styleUrls: ['./login.css']
})
export class LoginComponent implements OnInit {
    isLogin = true;
    isLoading = false;
    errorMessage = '';
    successMessage = '';

    // Form fields
    email = '';
    password = '';
    name = '';
    confirmPassword = '';

    constructor(private authService: AuthService, private router: Router) { }

    ngOnInit(): void {
        // Initialize Google Sign-In
        this.initGoogleSignIn();

        // Redirect if already logged in
        if (this.authService.isAuthenticated()) {
            this.router.navigate(['/']);
        }
    }

    private initGoogleSignIn(): void {
        if (window.google) {
            window.google.accounts.id.initialize({
                client_id: '52041753942-p2ptk8ilsft4rbvbqeivr7404u2sgkfm.apps.googleusercontent.com',
                callback: (response: any) => this.handleGoogleLogin(response)
            });

            const buttonElement = document.getElementById('google-signin-button');
            if (buttonElement) {
                window.google.accounts.id.renderButton(buttonElement, {
                    theme: 'outline',
                    size: 'large',
                    width: '100%'
                });
            }
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

    toggleForm(): void {
        this.isLogin = !this.isLogin;
        this.errorMessage = '';
        this.successMessage = '';
        this.resetForm();
    }

    onSubmit(): void {
        this.errorMessage = '';
        this.successMessage = '';

        if (this.isLogin) {
            this.handleLogin();
        } else {
            this.handleSignup();
        }
    }

    private handleLogin(): void {
        if (!this.email || !this.password) {
            this.errorMessage = 'Please enter email and password';
            return;
        }

        this.isLoading = true;
        this.authService.login(this.email, this.password).subscribe({
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
                this.errorMessage = 'Login failed. Please try again.';
                this.isLoading = false;
            }
        });
    }

    private handleSignup(): void {
        if (!this.email || !this.password || !this.name) {
            this.errorMessage = 'Please fill in all fields';
            return;
        }

        if (this.password.length < 6) {
            this.errorMessage = 'Password must be at least 6 characters';
            return;
        }

        if (this.password !== this.confirmPassword) {
            this.errorMessage = 'Passwords do not match';
            return;
        }

        this.isLoading = true;
        this.authService.signup(this.email, this.password, this.name).subscribe({
            next: (res) => {
                if (res.success) {
                    this.successMessage = 'Account created successfully! Redirecting...';
                    setTimeout(() => this.router.navigate(['/']), 1500);
                } else {
                    this.errorMessage = res.message || 'Signup failed';
                }
                this.isLoading = false;
            },
            error: (error) => {
                console.error('Signup error:', error);
                this.errorMessage = 'Signup failed. Please try again.';
                this.isLoading = false;
            }
        });
    }

    private resetForm(): void {
        this.email = '';
        this.password = '';
        this.name = '';
        this.confirmPassword = '';
    }
}
