import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajesService } from '../../services/mensajes.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'login',
  standalone: true,
  imports: [ RouterLink, ReactiveFormsModule, CommonModule ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})

export class LoginComponent {
  public loginForm: FormGroup;
  public inicioExitoso!: boolean;

  constructor(
    private fb: FormBuilder,
    private _router: Router,
    private _authService: AuthService,
    private _mensajesService: MensajesService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  get email() {
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  public autocompletarAdmin() {
    this.loginForm.patchValue({ email: 'test1@test.com', password: 'admin123' });
  }

  public autocompletarEspecialista() {
    this.loginForm.patchValue({ email: 'test2@test.com', password: 'especialista123' });
  }

  public autocompletarPaciente() {
    this.loginForm.patchValue({ email: 'test3@test.com', password: 'paciente123' });
  }

  public iniciarSesion() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this._mensajesService.lanzarMensajeError("ERROR", "Debes completar todos los campos para iniciar sesión");
      return;
    }

    const { email, password } = this.loginForm.value;

    this._authService.iniciarSesion(email, password)
      .then(() => location.reload())
      .catch(error => {
        let mensaje = "";
        if (error.message == "auth/email-no-verified") {
          mensaje = "Por favor, verifica tu correo electrónico para poder iniciar sesión";
        } else {
          mensaje = "Las credenciales son inválidas, reinténtelo nuevamente.";
        }
        this._mensajesService.lanzarMensajeError("ERROR", mensaje);
      });
  }
}