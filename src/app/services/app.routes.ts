import { Routes } from '@angular/router';
import { LoginComponent } from '../pages/auth/login/login.component';
import { RegisterComponent } from '../pages/auth/register/register.component';
import { HomeComponent } from '../pages/home/home.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent,
    },
    {
        path: 'auth/register',
        component: RegisterComponent,
    },
    {
        path: 'auth/login',
        component: LoginComponent,
    },
];
