import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    constructor(private http: HttpClient) {}

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

    logout(): void {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
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
