import { Routes } from '@angular/router';
import { ErrorStateGuard } from '../pages/error/404/404.guard';

export const routes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('../pages/home/home.component').then((m) => m.HomeComponent),
    },
    {
        path: 'auth/login',
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
        loadComponent: () =>
            import('../pages/error/404/404.component').then(
                (m) => m.NotFoundPage
            ),
        canActivate: [ErrorStateGuard],
    },
    {
        path: 'error/500',
        loadComponent: () =>
            import('../pages/error/500/500.component').then(
                (m) => m.InternalErrorPage
            ),
    },
    {
        path: 'origins-and-founders',
        loadComponent: () =>
            import(
                '../pages/origins-and-founders/origins-and-founders.component'
            ).then((m) => m.OriginsAndFoundersComponent),
    },
    {
        path: 'about-role',
        loadComponent: () =>
            import('../pages/about-role/about-role.component').then(
                (m) => m.AboutRoleComponent
            ),
    },
    {
        path: 'program/create',
        loadComponent: () =>
            import('../pages/create-program/create-program.component').then(
                (m) => m.CreateProgramComponent
            ),
    },
    {
        path: 'program/:programId/manage',
        loadComponent: () =>
            import(
                '../pages/admin/manage-program/manage-program.component'
            ).then((m) => m.ManageProgramComponent),
    },
    {
        path: 'user-dashboard',
        loadComponent: () =>
            import(
                '../pages/admin/user-dashboard/user-dashboard.component'
            ).then((m) => m.UserDashboardComponent),
    },
    {
        path: 'admin/recruitment/active',
        loadComponent: () =>
            import(
                '../pages/admin/active-recruitments-management/active-recruitments-management.component'
            ).then((m) => m.ActiveRecruitmentsManagementComponent),
    },
    {
        path: 'admin/recruitment/closed',
        loadComponent: () =>
            import(
                '../pages/admin/closed-recruitments/closed-recruitments.component'
            ).then((m) => m.ClosedRecruitmentsComponent),
    },
];
