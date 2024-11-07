import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajesService } from '../../services/mensajes.service';
import { CommonModule } from '@angular/common';
import { usuariosAutocompletados } from '../../../secrets';
import { BackgroundImageDirective } from '../../directives/background-image.directive';

@Component({
  selector: 'login',
  standalone: true,
  imports: [ RouterLink, ReactiveFormsModule, CommonModule, BackgroundImageDirective ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  public loginForm: FormGroup;
  public inicioExitoso!: boolean;
  public usuarios: any[] = [];

  constructor(private fb: FormBuilder,private _router: Router, private _authService: AuthService, private _mensajesService: MensajesService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
    this.usuarios = usuariosAutocompletados;
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  public autocompletar(usuario: any) {
    this.loginForm.patchValue({ email: usuario.email, password: usuario.password });
  }

  public iniciarSesion() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this._mensajesService.lanzarMensajeError("ERROR", "Debes completar todos los campos para iniciar sesión");
      return;
    }

    const { email, password } = this.loginForm.value;

    this._authService.iniciarSesion(email, password)
      .then(() => this._router.navigate(["home"]))
      .catch(error => {
        let mensaje = "";
        switch(error.message) {
          case "auth/email-no-verified":
            mensaje = "Por favor, verifica tu correo electrónico para poder iniciar sesión";
          break;
          case "auth/specialist-no-activated":
            mensaje = "Nuestro equipo aún no ha revisado tu solicitud. Vuelve más tarde.";
          break;
          default:
            mensaje = "Las credenciales son inválidas, reinténtelo nuevamente.";
          break;
        }
        this._mensajesService.lanzarNotificacionErrorCentroConFuncionalidad("ERROR", mensaje, 3000, () => location.reload());
      })
  }
}