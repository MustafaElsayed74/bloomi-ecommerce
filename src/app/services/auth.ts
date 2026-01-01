import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

export interface AuthResponse {
    success: boolean;
    token: string;
    user: UserDto;
    message?: string;
}

export interface UserDto {
    id: number;
    email: string;
    name: string;
    profilePicture: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private apiUrl = 'https://localhost:7147/api/auth';
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
                    if (response.success) {
                        localStorage.setItem('authToken', response.token);
                        localStorage.setItem('currentUser', JSON.stringify(response.user));
                        this.currentUserSubject.next(response.user);
                    }
                })
            );
    }

    login(email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
            .pipe(
                tap(response => {
                    if (response.success) {
                        localStorage.setItem('authToken', response.token);
                        localStorage.setItem('currentUser', JSON.stringify(response.user));
                        this.currentUserSubject.next(response.user);
                    }
                })
            );
    }

    googleLogin(idToken: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/google-login`, { idToken })
            .pipe(
                tap(response => {
                    if (response.success) {
                        localStorage.setItem('authToken', response.token);
                        localStorage.setItem('currentUser', JSON.stringify(response.user));
                        this.currentUserSubject.next(response.user);
                    }
                })
            );
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