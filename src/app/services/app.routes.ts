import { Routes } from '@angular/router';
import { ErrorStateGuard } from '../pages/error/404/404.guard';
import { NotFoundPage } from '../pages/error/404/404.component';

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
        loadComponent: () =>
            import('../pages/user-profile/user-profile.component').then(
                (m) => m.UserProfileComponent
            ),
    },
    {
        path: 'error/404',
        component: NotFoundPage,
        canActivate: [ErrorStateGuard],
    },
    {
        path: 'origins-and-founders',
        loadComponent: () =>
            import('../pages/origins-and-founders/origins-and-founders.component').then(
                (m) => m.OriginsAndFoundersComponent
            ),
    },
];
