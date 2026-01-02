import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

@Component({
    selector: 'app-verify-email',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './verify-email.html',
    styleUrls: ['./verify-email.css']
})
export class VerifyEmailComponent implements OnInit {
    isVerifying = true;
    success = false;
    error = '';
    message = '';

    constructor(
        private authService: AuthService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.route.queryParams.subscribe(params => {
            const token = params['token'];
            if (token) {
                this.verifyEmail(token);
            } else {
                this.error = 'No verification token provided';
                this.isVerifying = false;
            }
        });
    }

    private verifyEmail(token: string): void {
        this.authService.verifyEmail(token).subscribe({
            next: (res) => {
                if (res.success) {
                    this.success = true;
                    this.message = 'Email verified successfully! Redirecting to login...';
                    setTimeout(() => this.router.navigate(['/login']), 2000);
                } else {
                    this.error = res.message || 'Email verification failed';
                }
                this.isVerifying = false;
            },
            error: (error) => {
                console.error('Verification error:', error);
                this.error = error?.error?.message || 'Verification failed. Token may have expired.';
                this.isVerifying = false;
            }
        });
    }

    redirectToLogin(): void {
        this.router.navigate(['/login']);
    }
}
