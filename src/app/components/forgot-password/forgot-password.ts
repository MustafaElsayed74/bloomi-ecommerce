import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-forgot-password',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './forgot-password.html',
    styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
    email: string = '';
    isLoading: boolean = false;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private authService: AuthService,
        private router: Router
    ) { }

    handleSubmit(): void {
        if (!this.email) {
            this.errorMessage = 'Please enter your email address';
            return;
        }

        this.isLoading = true;
        this.successMessage = '';
        this.errorMessage = '';

        this.authService.forgotPassword(this.email).subscribe({
            next: (response) => {
                this.successMessage = 'Password reset email sent! Check your inbox for instructions.';
                this.email = '';
                this.isLoading = false;

                // Redirect to login after 3 seconds
                setTimeout(() => {
                    this.router.navigate(['/login']);
                }, 3000);
            },
            error: (error: any) => {
                this.errorMessage = error.error?.message || 'Failed to send reset email. Please try again.';
                this.isLoading = false;
            }
        });
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }
}
