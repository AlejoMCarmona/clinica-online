import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
    { path: 'registro', loadComponent: () => import('./pages/registro/registro.component').then(m => m.RegistroComponent) }
];
