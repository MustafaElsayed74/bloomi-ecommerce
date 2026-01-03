import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reset-password.html',
    styleUrls: ['./reset-password.css']
})
export class ResetPasswordComponent implements OnInit {
    token: string = '';
    newPassword: string = '';
    confirmPassword: string = '';
    isLoading: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';
    showPassword: boolean = false;
    showConfirmPassword: boolean = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    ngOnInit(): void {
        // Get token from query params
        this.route.queryParams.subscribe(params => {
            this.token = params['token'] || '';
            if (!this.token) {
                this.errorMessage = 'Invalid reset link. Please request a new password reset.';
            }
        });
    }

    handleSubmit(): void {
        this.errorMessage = '';
        this.successMessage = '';

        // Validation
        if (!this.newPassword || !this.confirmPassword) {
            this.errorMessage = 'Please fill in all fields';
            return;
        }

        if (this.newPassword.length < 6) {
            this.errorMessage = 'Password must be at least 6 characters long';
            return;
        }

        if (this.newPassword !== this.confirmPassword) {
            this.errorMessage = 'Passwords do not match';
            return;
        }

        if (!this.token) {
            this.errorMessage = 'Invalid reset link. Please request a new password reset.';
            return;
        }

        this.isLoading = true;

        this.authService.resetPassword(this.token, this.newPassword).subscribe({
            next: (response) => {
                this.successMessage = 'Password reset successful! Redirecting to login...';
                this.isLoading = false;

                // Redirect to login after 2 seconds
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 2000);
            },
            error: (error: any) => {
                this.errorMessage = error.error?.message || 'Failed to reset password. The link may have expired.';
                this.isLoading = false;
            }
        });
    }

    togglePasswordVisibility(): void {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility(): void {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }
}
