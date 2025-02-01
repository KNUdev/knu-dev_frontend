import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        loadChildren: () => import('./home.routes').then((m) => m.HOME_ROUTES),
    },
    {
        path: 'auth',
        loadChildren: () => import('./auth.routes').then((m) => m.AUTH_ROUTES),
    },
];
