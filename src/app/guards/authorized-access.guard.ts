import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authorizedAccessGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const estaLogueado = await authService.estaAutenticado();
  
  if (!estaLogueado) {
    router.navigate(['acceso-no-autorizado']);
    return false;
  }

  // Obtén el rol esperado desde los datos de la ruta
  const rolesEsperados = route.data['rol'] as string[] | undefined;

  if (rolesEsperados && rolesEsperados?.length > 0) {
    const emailUsuario = await authService.obtenerEmailUsuario();
    const usuarioRol = await authService.obtenerRolPorEmail(emailUsuario);
    if (rolesEsperados.includes(usuarioRol)) {
      return true;
    }
    router.navigate(['acceso-no-autorizado']);
    return false;
  }
  return true;
};