import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

interface UserInfo {
    id: string;
    email: string;
    roles: string[];
}
interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private currentUser = new BehaviorSubject<UserInfo | null>(null);
    currentUser$ = this.currentUser.asObservable();

    setCurrentUser(user: UserInfo) {
        this.currentUser.next(user);
    }

    getCurrentUser() {
        return this.currentUser.value;
    }

    clearCurrentUser() {
        this.currentUser.next(null);
    }
    constructor(private http: HttpClient, private router: Router) {}

    refreshToken(): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(
            `${environment.apiBaseUrl}/auth/refresh-token`,
            {},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem(
                        'refreshToken'
                    )}`,
                },
            }
        );
    }

    logout() {
        // Clear cookies
        document.cookie =
            'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure';
        document.cookie =
            'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure';

        // Clear user data
        this.currentUser.next(null);

        // Redirect to login page
        this.router.navigate(['/auth/login']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem('accessToken');
    }

    getAccessToken(): string | null {
        return localStorage.getItem('accessToken');
    }

    getRefreshToken(): string | null {
        return localStorage.getItem('refreshToken');
    }
}
