import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface AuthResponse {
    success: boolean;
    token?: string;
    user?: UserDto;
    message?: string;
    emailVerificationRequired?: boolean;
}

export interface UserDto {
    id: number;
    email: string;
    name: string;
    profilePicture?: string;
    address?: string;
    phoneNumber?: string;
    isPhoneVerified?: boolean;
    verifiedPhoneNumbers?: string[];
}

export interface UpdateProfilePayload {
    name?: string;
    address?: string;
    phoneNumber?: string;
    profilePicture?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = `${environment.apiUrl}/auth`;
    private profileApiUrl = `${environment.apiUrl}/profile`;
    private currentUserSubject = new BehaviorSubject<UserDto | null>(this.getUserFromStorage());
    public currentUser$ = this.currentUserSubject.asObservable();
    public isAuthenticated$ = this.currentUserSubject.asObservable().pipe(
        map(user => !!user)
    );

    constructor(private http: HttpClient) {
        this.loadStoredToken();
    }

    private loadStoredToken(): void {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        if (token && user) {
            this.currentUserSubject.next(JSON.parse(user));
        }
    }

    signup(email: string, password: string, name: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, { email, password, name })
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.user) {
                        localStorage.setItem('authToken', response.token);
                        localStorage.setItem('currentUser', JSON.stringify(response.user));
                        this.currentUserSubject.next(response.user);
                    } else if (response.success && response.emailVerificationRequired) {
                        this.currentUserSubject.next(null);
                    }
                })
            );
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.user) {
                        localStorage.setItem('authToken', response.token);
                        localStorage.setItem('currentUser', JSON.stringify(response.user));
                        this.currentUserSubject.next(response.user);
                    } else if (response.emailVerificationRequired) {
                        this.logout();
                    }
                })
            );
    }

    googleLogin(idToken: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/google-login`, { idToken })
            .pipe(
                tap(response => {
                    if (response.success && response.token && response.user) {
                        localStorage.setItem('authToken', response.token);
                        localStorage.setItem('currentUser', JSON.stringify(response.user));
                        this.currentUserSubject.next(response.user);
                    }
                })
            );
    }

    getProfile(): Observable<UserDto> {
        return this.http.get<UserDto>(`${this.profileApiUrl}/me`).pipe(
            tap(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    updateProfile(payload: UpdateProfilePayload): Observable<UserDto> {
        return this.http.put<UserDto>(`${this.profileApiUrl}/me`, payload).pipe(
            tap(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    sendPhoneVerificationCode(phoneNumber: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.profileApiUrl}/phone/send-code`, { phoneNumber });
    }

    verifyPhoneCode(code: string): Observable<UserDto> {
        return this.http.post<UserDto>(`${this.profileApiUrl}/phone/verify-code`, { code }).pipe(
            tap(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    deleteVerifiedPhone(phoneNumber: string): Observable<UserDto> {
        return this.http.delete<UserDto>(`${this.profileApiUrl}/phone/verified/${encodeURIComponent(phoneNumber)}`).pipe(
            tap(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    uploadProfilePicture(file: File): Observable<UserDto> {
        const formData = new FormData();
        formData.append('file', file);

        return this.http.post<UserDto>(`${this.profileApiUrl}/upload-picture`, formData).pipe(
            tap(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
            })
        );
    }

    verifyEmail(token: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/verify-email`, { token });
    }

    forgotPassword(email: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/forgot-password`, { email });
    }

    resetPassword(token: string, newPassword: string): Observable<{ message: string }> {
        return this.http.post<{ message: string }>(`${this.apiUrl}/reset-password`, { token, newPassword });
    }

    logout(): void {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
    }

    getToken(): string | null {
        return localStorage.getItem('authToken');
    }

    getCurrentUser(): UserDto | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return !!this.getToken();
    }

    private getUserFromStorage(): UserDto | null {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }
}
