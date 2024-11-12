import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MensajesService } from '../../../services/mensajes.service';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { Usuario } from '../../../models/usuarios.interface';
import { StorageService } from '../../../services/storage.service';
import { CommonModule } from '@angular/common';
import { CaptchaComponent } from '../../captcha/captcha/captcha.component';

@Component({
  selector: 'registro-admin',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, CaptchaComponent ],
  templateUrl: './registro-admin.component.html',
  styleUrl: './registro-admin.component.css'
})

export class RegistroAdminComponent {
  public adminFormulario!: FormGroup;
  public imagenSubida!: File;
  public estaCargando!: boolean;
  public captchaValido: boolean = false;
  @Output() registroCompletado = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private __mensajesService: MensajesService, private _authService: AuthService, private _router: Router, private _storageService: StorageService) {
    this.adminFormulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[A-Za-z]+( [A-Za-z]+)*$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[A-Za-z]+( [A-Za-z]+)*$')]],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      imagen: ['', Validators.required]
    });
  }

  get nombre() {
    return this.adminFormulario.get('nombre');
  }

  get apellido() {
    return this.adminFormulario.get('apellido');
  }

  get edad() {
    return this.adminFormulario.get('edad');
  }

  get dni() {
    return this.adminFormulario.get('dni');
  }

  get mail() {
    return this.adminFormulario.get('mail');
  }

  get password() {
    return this.adminFormulario.get('password');
  }

  get imagen() {
    return this.adminFormulario.get('imagen');
  }

  public seleccionarImagen(event: any) {
    this.imagenSubida = event.target.files[0];
  }

  public async registrarAdmin() {
    try {
      if (!this.adminFormulario.valid) {
        this.adminFormulario.markAllAsTouched();
        return;
      }
      if (!this.captchaValido) {
        this.__mensajesService.lanzarMensajeError("ERROR", "Debes completar el captcha correctamente");
        return;
      }

      this.estaCargando = true;
      const admin: Usuario = {
        email: this.mail?.value,
        rol: "admin",
        autorizado: true, // Los administradores son autorizados por defecto
        informacion: {
          nombre: this.nombre?.value,
          apellido: this.apellido?.value,
          edad: this.edad?.value,
          dni: this.dni?.value,
        }
      };

      let idUsuarioCreado;
      try {
        idUsuarioCreado = await this._authService.registrarUsuarioConVerificacion(this.mail?.value, this.password?.value, admin);
      } catch (error) {
        console.error("Error al registrar el usuario: ", error);
        this.__mensajesService.lanzarMensajeError("Error", "Hubo un problema al registrar el usuario. Por favor, inténtalo más tarde.");
        return;
      }

      if (idUsuarioCreado !== undefined) {
        try {
          await this._storageService.subirImagen(this.imagenSubida, "fotos-perfil/admins", idUsuarioCreado);
          this.__mensajesService.lanzarMensajeExitoso(":)", "El proceso de creación de tu usuario como administrador fue exitoso.");
          this.adminFormulario.reset();
          this.registroCompletado.emit();
        } catch (error) {
          console.error("Error al subir la imagen: ", error);
          this.__mensajesService.lanzarMensajeError("Error", "El usuario fue creado, pero hubo un problema al subir la imagen de perfil. Por favor, contáctanos para más detalles.");
        }
      }
    } catch (error) {
      console.error("Error inesperado en el proceso de registro: ", error);
      this.__mensajesService.lanzarMensajeError("Error", "Ocurrió un error inesperado. Por favor, inténtalo más tarde.");
    } finally {
      this.estaCargando = false;
    }
  }
}