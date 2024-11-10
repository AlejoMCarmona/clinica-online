import { Routes } from '@angular/router';
import { authorizedAccessGuard } from './guards/authorized-access.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', loadComponent: () => import('./pages/home/home-page.component').then(m => m.HomePageComponent) },
    { path: 'registro', loadComponent: () => import('./pages/registro/registro-page.component').then(m => m.RegistroPageComponent) },
    { path: 'login', loadComponent: () => import('./pages/login/login-page.component').then(m => m.LoginPageComponent) },
    { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios-page.component').then(m => m.UsuariosPageComponent), canActivate: [ authorizedAccessGuard ], data: { rol: ['admin'] } },
    { path: 'nuevo-turno', loadComponent: () => import('./pages/nuevo-turno/nuevo-turno-page.component').then(m => m.NuevoTurnoPageComponent), canActivate: [ authorizedAccessGuard ], data: { rol: ['admin', 'paciente'] } },
    { path: 'mi-perfil', loadComponent: () => import('./pages/mi-perfil/mi-perfil-page.component').then(m => m.MiPerfilPageComponent), canActivate: [ authorizedAccessGuard ] }
];