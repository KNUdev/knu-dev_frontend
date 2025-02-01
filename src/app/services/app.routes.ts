import { Routes } from '@angular/router';

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
        path: 'register',
        loadComponent: () =>
            import('../pages/auth/register/register.component').then(
                (m) => m.RegisterComponent
            ),
    },
];
