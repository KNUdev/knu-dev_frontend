import { Routes } from '@angular/router';
import {AboutRoleComponent} from '../pages/about-role/about-role.component';

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
        path: 'about-role',
        component: AboutRoleComponent
    }
];
