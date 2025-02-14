import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment.development';

interface AuthResponse {
    accessToken: string;
    refreshToken: string;
}

export interface JwtPayload {
    sub: string;
    userid: string;
    roles: string[];
    email: string;
}

export interface UserInfo {
    id: string;
    email: string;
    roles: string[];
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private readonly userInfo = signal<UserInfo>({
        id: '',
        email: '',
        roles: ['noAuth'],
    });
    public readonly isAuthenticated = signal<boolean>(false);
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
    constructor(private http: HttpClient, private router: Router) {
        this.initializeFromToken();
    }

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
        document.cookie =
            'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure';
        document.cookie =
            'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict; Secure';

        this.userInfo.set({
            id: '',
            email: '',
            roles: ['noAuth'],
        });
        this.isAuthenticated.set(false);

        this.router.navigate(['/auth/login']);
    }

    updateAuthState(response: AuthResponse) {
        document.cookie = `accessToken=${response.accessToken}; path=/; SameSite=Strict; Secure`;
        document.cookie = `refreshToken=${response.refreshToken}; path=/; SameSite=Strict; Secure`;

        const payload = this.decodeJwt(response.accessToken);
        if (payload) {
            this.userInfo.set({
                id: payload.userid,
                email: payload.sub,
                roles: payload.roles,
            });
            this.isAuthenticated.set(true);
        }
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

    public getUserInfo(): UserInfo {
        return this.userInfo();
    }

    public getCurrentUserId(): string {
        return this.userInfo().id;
    }

    public getUserState(): UserInfo {
        return this.userInfo();
    }

    public initializeFromToken(): void {
        const token = this.getCookie('accessToken');
        if (token) {
            const payload = this.decodeJwt(token);
            if (payload) {
                this.userInfo.set({
                    id: payload.userid,
                    email: payload.sub,
                    roles: payload.roles,
                });
                this.isAuthenticated.set(true);
            }
        }
    }

    private getCookie(name: string): string | null {
        const matches = document.cookie.match(
            new RegExp(
                '(?:^|; )' +
                    name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') +
                    '=([^;]*)'
            )
        );
        return matches ? decodeURIComponent(matches[1]) : null;
    }

    private decodeJwt(token: string): JwtPayload | null {
        try {
            const payloadPart = token.split('.')[1];
            const decoded = atob(payloadPart);
            return JSON.parse(decoded);
        } catch (e) {
            console.error('Failed to decode token:', e);
            return null;
        }
    }
}
