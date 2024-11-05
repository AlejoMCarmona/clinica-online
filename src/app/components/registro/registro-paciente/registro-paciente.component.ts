import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Paciente } from '../../../models/paciente.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { AuthService } from '../../../services/auth.service';
import { StorageService } from '../../../services/storage.service';
import { MensajesService } from '../../../services/mensajes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'registro-paciente',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './registro-paciente.component.html',
  styleUrl: './registro-paciente.component.css'
})

export class RegistroPacienteComponent {
  public pacienteFormulario!: FormGroup;
  public imagenPerfilPrimariaSubida!: File;
  public imagenPerfilSecundariaSubida!: File;
  public estaCargando: boolean = false;
  @Output() registroCompletado = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private _authService: AuthService, private _mensajesService: MensajesService, private _storageService: StorageService, private _router: Router) {
    this.pacienteFormulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[A-Za-z]+( [A-Za-z]+)*$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[A-Za-z]+( [A-Za-z]+)*$')]],
      edad: ['', [Validators.required, Validators.min(0), Validators.max(120)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      obraSocial: ['', [Validators.required, Validators.pattern('^[A-Za-z]+( [A-Za-z]+)*$')]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      imagenPerfilPrimaria: [null, Validators.required],
      imagenPerfilSecundaria: [null, Validators.required]
    });
  }

    get nombre() {
      return this.pacienteFormulario.get('nombre');
    }
  
    get apellido() {
      return this.pacienteFormulario.get('apellido');
    }
  
    get edad() {
      return this.pacienteFormulario.get('edad');
    }
  
    get dni() {
      return this.pacienteFormulario.get('dni');
    }
  
    get obraSocial() {
      return this.pacienteFormulario.get('obraSocial');
    }
  
    get email() {
      return this.pacienteFormulario.get('email');
    }
  
    get password() {
      return this.pacienteFormulario.get('password');
    }
  
    get imagenPerfilPrimaria() {
      return this.pacienteFormulario.get('imagenPerfilPrimaria');
    }

    get imagenPerfilSecundaria() {
      return this.pacienteFormulario.get('imagenPerfilSecundaria');
    }

    public seleccionarImagenPrimaria(event: any) {
      this.imagenPerfilPrimariaSubida = event.target.files[0];
    }

    public seleccionarImagenSecundaria(event: any) {
      this.imagenPerfilSecundariaSubida = event.target.files[0];
    }

  public async registrarPaciente() {
    try {
      if (!this.pacienteFormulario.valid) {
        this.pacienteFormulario.markAllAsTouched();
        return;
      }
  
      this.estaCargando = true;
      const paciente: Paciente = {
        nombre: this.nombre?.value,
        apellido: this.apellido?.value,
        edad: this.edad?.value,
        dni: this.dni?.value,
        obraSocial: this.obraSocial?.value,
      };
  
      const usuario: Usuario = {
        email: this.email?.value,
        rol: "paciente",
        informacion: paciente,
        autorizado: true
      };
  
      let idUsuarioCreado;
      try {
        idUsuarioCreado = await this._authService.registrarUsuarioConVerificacion(this.email?.value, this.password?.value, usuario);
      } catch (error) {
        console.error("Error al registrar el usuario: ", error);
        this._mensajesService.lanzarMensajeError("Error", "Hubo un problema al registrar el usuario. Por favor, inténtalo más tarde.");
        return;
      }
  
      if (idUsuarioCreado !== undefined) {
        try {
          await this._storageService.subirImagen(this.imagenPerfilPrimariaSubida, "fotos-perfil/pacientes", idUsuarioCreado + "-primaria");
          await this._storageService.subirImagen(this.imagenPerfilSecundariaSubida, "fotos-perfil/pacientes", idUsuarioCreado + "-secundaria");
          this._mensajesService.lanzarMensajeExitoso(":)", "El proceso de creación de tu usuario como paciente fue exitoso. Debes verificar tu correo electrónico para poder iniciar sesión.");
          this.pacienteFormulario.reset();
          this.registroCompletado.emit();
        } catch (error) {
          console.error("Error al subir la imagen: ", error);
          this._mensajesService.lanzarMensajeError("Error", "El usuario fue creado, pero hubo un problema al subir la imagen de perfil. Por favor, contáctanos para más detalles.");
        }
      }
    } catch (error) {
      console.error("Error inesperado en el proceso de registro: ", error);
      this._mensajesService.lanzarMensajeError("Error", "Ocurrió un error inesperado. Por favor, inténtalo más tarde.");
    } finally {
      this.estaCargando = false;
    }
  }
}
