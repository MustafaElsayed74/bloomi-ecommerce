import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService, UpdateProfilePayload, UserDto } from '../../services/auth';

@Component({
    selector: 'app-profile-settings',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './profile-settings.html',
    styleUrl: './profile-settings.css'
})
export class ProfileSettings implements OnInit {
    name = '';
    email = '';
    address = '';
    phoneNumber = '';
    profilePicture = '';
    isPhoneVerified = false;
    verifiedPhoneNumbers: string[] = [];
    verificationCode = '';
    verificationStatus = '';
    isSendingCode = false;
    isVerifyingCode = false;

    isLoading = false;
    isSaving = false;
    errorMessage = '';
    successMessage = '';

    showDeleteModal = false;
    phoneToDelete = '';

    selectedFile: File | null = null;
    isUploadingPicture = false;

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.fetchProfile();
    }

    onFileSelected(event: any): void {
        const file = event.target.files[0];
        if (file) {
            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                this.errorMessage = 'Invalid file type. Only images are allowed (jpg, jpeg, png, gif, webp)';
                setTimeout(() => this.errorMessage = '', 5000);
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.errorMessage = 'File size exceeds 5MB limit';
                setTimeout(() => this.errorMessage = '', 5000);
                return;
            }

            this.selectedFile = file;
            this.uploadProfilePicture();
        }
    }

    uploadProfilePicture(): void {
        if (!this.selectedFile) {
            return;
        }

        this.isUploadingPicture = true;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.uploadProfilePicture(this.selectedFile).subscribe({
            next: (user) => {
                this.profilePicture = user.profilePicture ?? '';
                this.successMessage = 'Profile picture updated successfully!';
                setTimeout(() => this.successMessage = '', 5000);
                this.isUploadingPicture = false;
                this.selectedFile = null;
            },
            error: (err) => {
                this.errorMessage = err?.error?.message || 'Failed to upload profile picture. Please try again.';
                setTimeout(() => this.errorMessage = '', 5000);
                this.isUploadingPicture = false;
                this.selectedFile = null;
            }
        });
    }

    triggerFileInput(): void {
        const fileInput = document.getElementById('profile-picture-input') as HTMLInputElement;
        fileInput?.click();
    }

    fetchProfile(): void {
        this.isLoading = true;
        this.errorMessage = '';
        const token = this.authService.getToken();

        if (!token) {
            this.errorMessage = 'Not authenticated. Please log in first.';
            this.isLoading = false;
            return;
        }

        this.authService.getProfile().subscribe({
            next: (user: UserDto) => {
                this.name = user.name ?? '';
                this.email = user.email ?? '';
                this.address = user.address ?? '';
                this.phoneNumber = user.phoneNumber ?? '';
                this.profilePicture = user.profilePicture ?? '';
                this.isPhoneVerified = user.isPhoneVerified ?? false;
                this.verifiedPhoneNumbers = user.verifiedPhoneNumbers ?? [];
                this.isLoading = false;
            },
            error: (err) => {
                console.error('Profile fetch error:', err);
                this.errorMessage = 'Unable to load profile. Please try again.';
                this.isLoading = false;
            }
        });
    }

    save(): void {
        if (!this.name.trim()) {
            this.errorMessage = 'Name is required.';
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';
        this.isSaving = true;

        const payload: UpdateProfilePayload = {
            name: this.name.trim(),
            address: this.address.trim() || undefined,
            phoneNumber: this.phoneNumber.trim() || undefined,
            profilePicture: this.profilePicture.trim() || undefined
        };

        this.authService.updateProfile(payload).subscribe({
            next: (updated) => {
                this.successMessage = 'Profile updated successfully.';
                this.isSaving = false;
                this.name = updated.name ?? '';
                this.address = updated.address ?? '';
                this.phoneNumber = updated.phoneNumber ?? '';
                this.profilePicture = updated.profilePicture ?? '';
                this.isPhoneVerified = updated.isPhoneVerified ?? false;
                this.verifiedPhoneNumbers = updated.verifiedPhoneNumbers ?? [];
            },
            error: () => {
                this.errorMessage = 'Failed to update profile. Please try again.';
                this.isSaving = false;
            }
        });
    }

    sendVerificationCode(): void {
        const trimmedPhone = this.phoneNumber.trim();
        if (!trimmedPhone) {
            this.errorMessage = 'Phone number is required before sending a code.';
            return;
        }

        if (!/^01[0125][0-9]{8}$/.test(trimmedPhone)) {
            this.errorMessage = 'Enter a valid Egyptian mobile number (e.g., 01012345678).';
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';
        this.verificationStatus = '';
        this.isSendingCode = true;

        this.authService.sendPhoneVerificationCode(trimmedPhone).subscribe({
            next: () => {
                this.successMessage = 'Verification code sent via SMS.';
                this.verificationStatus = 'Enter the 6-digit code we sent to your phone.';
                this.isPhoneVerified = false;
                this.isSendingCode = false;
            },
            error: (err) => {
                this.errorMessage = err?.error?.message || 'Unable to send verification code.';
                this.isSendingCode = false;
            }
        });
    }

    verifyPhoneCode(): void {
        const trimmedCode = this.verificationCode.trim();
        if (trimmedCode.length !== 6) {
            this.errorMessage = 'Enter the 6-digit code to verify your phone.';
            return;
        }

        this.errorMessage = '';
        this.successMessage = '';
        this.isVerifyingCode = true;

        this.authService.verifyPhoneCode(trimmedCode).subscribe({
            next: (user) => {
                this.successMessage = 'Phone number verified successfully.';
                this.isPhoneVerified = user.isPhoneVerified ?? true;
                this.verifiedPhoneNumbers = user.verifiedPhoneNumbers ?? [];
                this.verificationStatus = '';
                this.verificationCode = '';
                this.phoneNumber = user.phoneNumber ?? this.phoneNumber;
                this.isVerifyingCode = false;
            },
            error: (err) => {
                this.errorMessage = err?.error?.message || 'Invalid or expired code. Please request a new one.';
                this.isVerifyingCode = false;
            }
        });
    }

    deleteVerifiedPhone(phoneNumber: string): void {
        this.phoneToDelete = phoneNumber;
        this.showDeleteModal = true;
    }

    confirmDelete(): void {
        this.showDeleteModal = false;
        this.errorMessage = '';
        this.successMessage = '';

        this.authService.deleteVerifiedPhone(this.phoneToDelete).subscribe({
            next: (user) => {
                this.successMessage = `${this.phoneToDelete} removed successfully.`;
                this.verifiedPhoneNumbers = user.verifiedPhoneNumbers ?? [];
                this.isPhoneVerified = user.isPhoneVerified ?? false;
                this.phoneNumber = user.phoneNumber ?? this.phoneNumber;
                setTimeout(() => this.successMessage = '', 5000);
                this.phoneToDelete = '';
            },
            error: () => {
                this.errorMessage = 'Failed to remove phone number. Please try again.';
                setTimeout(() => this.errorMessage = '', 5000);
                this.phoneToDelete = '';
            }
        });
    }

    cancelDelete(): void {
        this.showDeleteModal = false;
        this.phoneToDelete = '';
    }
}

