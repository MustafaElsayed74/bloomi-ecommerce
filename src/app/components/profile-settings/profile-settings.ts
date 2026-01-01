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

    isLoading = false;
    isSaving = false;
    errorMessage = '';
    successMessage = '';

    constructor(private authService: AuthService) { }

    ngOnInit(): void {
        this.fetchProfile();
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
            },
            error: () => {
                this.errorMessage = 'Failed to update profile. Please try again.';
                this.isSaving = false;
            }
        });
    }
}

