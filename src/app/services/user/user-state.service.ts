import { computed, Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import {
    AccountProfile,
    TECHNICAL_ROLE_COLORS,
    TECHNICAL_ROLES,
    TechnicalRole,
} from './user.model';

export interface UserState {
    id: string;
    email: string;
    roles: string[];
    profile: AccountProfile | null;
    isAuthenticated: boolean;
}

@Injectable({
    providedIn: 'root',
})
export class UserStateService {
    private readonly initialState: UserState = {
        id: '',
        email: '',
        roles: ['noAuth'],
        profile: null,
        isAuthenticated: false,
    };

    private readonly state = signal<UserState>(this.initialState);
    private readonly stateChange = new BehaviorSubject<UserState>(
        this.initialState
    );

    readonly state$ = this.stateChange.asObservable();

    updateState(partialState: Partial<UserState>) {
        const newState = { ...this.state(), ...partialState };
        this.state.set(newState);
        this.stateChange.next(newState);
    }

    getState(): UserState {
        return this.state();
    }

    clearState() {
        this.state.set(this.initialState);
        this.stateChange.next(this.initialState);
    }

    get isAuthenticated(): boolean {
        return this.state().isAuthenticated;
    }

    get currentUser(): { id: string; email: string; roles: string[] } {
        const { id, email, roles } = this.state();
        return { id, email, roles };
    }

    get userProfile(): AccountProfile | null {
        return this.state().profile;
    }

    readonly getTechnicalRole = computed(() => {
        const roles = this.currentUser.roles;
        return (
            roles.find((role) =>
                TECHNICAL_ROLES.includes(role as TechnicalRole)
            ) || TechnicalRole.NONE
        );
    });

    readonly getAdministrativeRole = computed(() => {
        const roles = this.currentUser.roles;
        return (
            roles.find(
                (role) => !TECHNICAL_ROLES.includes(role as TechnicalRole)
            ) || ''
        );
    });

    getTechnicalRoleColor(role: string): string {
        return TECHNICAL_ROLE_COLORS[role as TechnicalRole] || '#ffffff';
    }
}
