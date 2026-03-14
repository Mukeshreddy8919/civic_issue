import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
  { 
    path: 'citizen', 
    canActivate: [authGuard], 
    data: { role: 'CITIZEN' },
    children: [
      { path: 'dashboard', loadComponent: () => import('./components/citizen/dashboard/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'submit', loadComponent: () => import('./components/citizen/submit/submit.component').then(m => m.SubmitComponent) },
      { path: 'my-grievances', loadComponent: () => import('./components/citizen/my-grievances/my-grievances.component').then(m => m.MyGrievancesComponent) }
    ]
  },
  { 
    path: 'admin', 
    canActivate: [authGuard], 
    data: { role: 'ADMIN' },
    children: [
      { path: '', loadComponent: () => import('./components/admin/admin.component').then(m => m.AdminComponent) },
      { path: 'reports', loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent) }
    ]
  },
  { 
    path: 'officer', 
    canActivate: [authGuard], 
    data: { role: 'OFFICER' },
    children: [
      { path: '', loadComponent: () => import('./components/officer/officer.component').then(m => m.OfficerComponent) },
      { path: 'reports', loadComponent: () => import('./components/reports/reports.component').then(m => m.ReportsComponent) }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
