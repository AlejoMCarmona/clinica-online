import { Routes } from '@angular/router';
import { authorizedAccessGuard } from './guards/authorized-access.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/home', pathMatch: "full" },
    { path: 'home', loadComponent: () => import('./pages/home/home-page.component').then(m => m.HomePageComponent), data: { animation: 'home' } },
    { path: 'registro', loadComponent: () => import('./pages/registro/registro-page.component').then(m => m.RegistroPageComponent), data: { animation: 'registro'} },
    { path: 'login', loadComponent: () => import('./pages/login/login-page.component').then(m => m.LoginPageComponent), data: { animation: 'login'} },
    { path: 'usuarios', loadComponent: () => import('./pages/usuarios/usuarios-page.component').then(m => m.UsuariosPageComponent), canActivate: [ authorizedAccessGuard ], data: { rol: ['admin'], animation: 'usuarios' } },
    { path: 'nuevo-turno', loadComponent: () => import('./pages/nuevo-turno/nuevo-turno-page.component').then(m => m.NuevoTurnoPageComponent), canActivate: [ authorizedAccessGuard ], data: { rol: ['admin', 'paciente'], animation: 'nuevo-turno' } },
    { path: 'mi-perfil', loadComponent: () => import('./pages/mi-perfil/mi-perfil-page.component').then(m => m.MiPerfilPageComponent), canActivate: [ authorizedAccessGuard ], data: { animation: 'mi-perfil' } },
    { path: 'mis-turnos', loadComponent: () => import('./pages/mis-turnos/mis-turnos-page.component').then(m => m.MisTurnosPageComponent), canActivate: [ authorizedAccessGuard ], data: { rol: ['especialista', 'paciente'], animation: 'mis-turnos' } },
    { path: 'turnos', loadComponent: () => import('./pages/turnos/turnos-page.component').then(m => m.TurnosPageComponent), canActivate: [ authorizedAccessGuard ], data: { rol: ['admin'], animation: 'turnos' } },
    { path: 'pacientes', loadComponent: () => import('./pages/pacientes/pacientes-page.component').then(m => m.PacientesPageComponent), canActivate: [ authorizedAccessGuard ], data: { rol: ['especialista'], animation: 'pacientes' } },
    { path: 'informes', loadComponent: () => import('./pages/informes/informes-page.component').then(m => m.InformesPageComponent), canActivate: [ authorizedAccessGuard ], data: { rol: ['admin'], animation: 'informes' } }
];