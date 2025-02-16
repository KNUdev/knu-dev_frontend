import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { UserStateService } from './user-state.module';

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

export interface TokenService {
    accessToken: string;
    refreshToken: string;
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
    private authStateSubject = new BehaviorSubject<boolean>(false);
    authStateChange$ = this.authStateSubject.asObservable();

    private readonly TOKEN_CONFIG = {
        ACCESS_TOKEN: 'accessToken',
        REFRESH_TOKEN: 'refreshToken',
        TOKEN_EXPIRES: 'Thu, 01 Jan 1970 00:00:01 GMT',
        COOKIE_PATH: '/',
        COOKIE_ATTRIBUTES: 'SameSite=Strict; Secure',
    } as const;

    setCurrentUser(user: UserInfo) {
        this.currentUser.next(user);
    }

    getCurrentUser() {
        return this.currentUser.value;
    }

    clearCurrentUser() {
        this.currentUser.next(null);
    }
    constructor(
        private http: HttpClient,
        private router: Router,
        private userState: UserStateService
    ) {
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

    private setToken(name: string, value: string): void {
        document.cookie = `${name}=${value}; path=${this.TOKEN_CONFIG.COOKIE_PATH}; ${this.TOKEN_CONFIG.COOKIE_ATTRIBUTES}`;
    }

    private clearToken(name: string): void {
        document.cookie = `${name}=; path=${this.TOKEN_CONFIG.COOKIE_PATH}; expires=${this.TOKEN_CONFIG.TOKEN_EXPIRES}; ${this.TOKEN_CONFIG.COOKIE_ATTRIBUTES}`;
    }

    logout() {
        this.clearToken(this.TOKEN_CONFIG.ACCESS_TOKEN);
        this.clearToken(this.TOKEN_CONFIG.REFRESH_TOKEN);
        this.userState.clearState();
        this.router.navigate(['/auth/login']);
    }

    updateAuthState(response: AuthResponse) {
        this.setToken(this.TOKEN_CONFIG.ACCESS_TOKEN, response.accessToken);
        this.setToken(this.TOKEN_CONFIG.REFRESH_TOKEN, response.refreshToken);

        const payload = this.decodeJwt(response.accessToken);
        if (payload) {
            this.userState.updateState({
                id: payload.userid,
                email: payload.sub,
                roles: payload.roles,
                isAuthenticated: true,
            });
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
                this.userState.updateState({
                    id: payload.userid,
                    email: payload.sub,
                    roles: payload.roles,
                    isAuthenticated: true,
                });
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
