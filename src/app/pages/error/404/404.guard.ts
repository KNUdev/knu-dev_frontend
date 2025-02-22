import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

interface InterceptorState {
    fromInterceptor?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ErrorStateGuard implements CanActivate {
    constructor(private router: Router) {}

    canActivate(): boolean {
        const state = history.state;
        const nav = this.router.getCurrentNavigation();
        const possibleState = nav?.extras.state as InterceptorState | undefined;
        if (possibleState?.fromInterceptor && state) {
            return true;
        }

            this.router.navigate(['/']);
        return false;
    }
}
