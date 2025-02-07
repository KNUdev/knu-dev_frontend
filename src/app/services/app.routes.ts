import { Routes } from '@angular/router';
import {UserProfileComponent} from '../pages/user-profile/user-profile.component';
import {ErrorStateGuard} from '../pages/error/404/404.guard';
import {NotFoundPage} from '../pages/error/404/404.component';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('../pages/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'login',
        loadComponent: () =>
            import('../pages/auth/login/login.component').then(
                (m) => m.LoginComponent
            ),
    },
    {
        path: 'auth/register',
        loadComponent: () =>
            import('../pages/auth/register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },
    {
        path: 'profile/:userId',
        component: UserProfileComponent
    },
    {
        path: 'error/404',
        component: NotFoundPage,
        canActivate: [ErrorStateGuard],
    },
];
