import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { Especialista } from '../../../models/especialista.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'registro-especialista',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.css'
})

export class RegistroEspecialistaComponent implements OnInit {
  public especialistaFormulario!: FormGroup;
  public listaEspecialidades: string[] = [];
  public imagenSubida!: File;

  constructor(private fb: FormBuilder, private _firestoreService: FirestoreService, private __mensajesService: MensajesService, private _authService: AuthService, private _router: Router, private _storageService: StorageService) {
    this.especialistaFormulario = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(0)]],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]{8}$')]],
      especialidades: this.fb.array([], Validators.required),
      nuevaEspecialidad: [''],
      mail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      imagen: ['', Validators.required]
    });
  }

  async ngOnInit(): Promise<void> {
    const listaEspecialidades = await this._firestoreService.obtenerDocumentos("especialidades", "nombre", "asc");
    listaEspecialidades.forEach(especialidad => {
      this.listaEspecialidades.push(especialidad.nombre);
    });
  }

  get nombre() {
    return this.especialistaFormulario.get('nombre');
  }

  get apellido() {
    return this.especialistaFormulario.get('apellido');
  }

  get edad() {
    return this.especialistaFormulario.get('edad');
  }

  get dni() {
    return this.especialistaFormulario.get('dni');
  }

  get especialidades() {
    return this.especialistaFormulario.get('especialidades') as FormArray;
  }

  get nuevaEspecialidad() {
    return this.especialistaFormulario.get('nuevaEspecialidad');
  }

  get mail() {
    return this.especialistaFormulario.get('mail');
  }

  get password() {
    return this.especialistaFormulario.get('password');
  }

  get imagen() {
    return this.especialistaFormulario.get('imagen');
  }

  public seleccionarImagen(event: any) {
    this.imagenSubida = event.target.files[0];
  }

  public onCheckboxChange(event: any) {
    const especialidadesArray: FormArray = this.especialidades;
    if (event.target.checked) {
      especialidadesArray.push(new FormControl(event.target.value));
    } else {
      const index = especialidadesArray.controls.findIndex(x => x.value === event.target.value);
      if (index !== -1) {
        especialidadesArray.removeAt(index);
      }
    }
  }
  
  public agregarNuevaEspecialidad() {
    if (this.nuevaEspecialidad?.value.trim() && !this.listaEspecialidades.includes(this.nuevaEspecialidad?.value)) {
      this.listaEspecialidades.push(this.nuevaEspecialidad?.value);
    }
  }

  public async registrarEspecialista() {
    try {
      if (!this.especialistaFormulario.valid) {
        this.especialistaFormulario.markAllAsTouched();
        return;
      }
  
      if (this.nuevaEspecialidad?.value) {
        try {
          this.especialidades.push(this.fb.control(this.nuevaEspecialidad.value));
          await this._firestoreService.subirDocumento({ nombre: this.nuevaEspecialidad.value }, "especialidades");
        } catch (error) {
          console.error("Error al subir la nueva especialidad: ", error);
          this.__mensajesService.lanzarMensajeError("Error", "Hubo un problema al agregar la nueva especialidad. Por favor, inténtalo más tarde.");
          return;
        }
      }
  
      const especialista: Especialista = {
        nombre: this.nombre?.value,
        apellido: this.apellido?.value,
        edad: this.edad?.value,
        dni: this.dni?.value,
        especialidades: this.especialidades.value
      };
  
      const usuario: Usuario = {
        email: this.mail?.value,
        rol: "especialista",
        informacion: especialista,
        autorizado: false
      };
  
      let idUsuarioCreado;
      try {
        idUsuarioCreado = await this._authService.registrarUsuarioConVerificacion(this.mail?.value, this.password?.value, usuario);
      } catch (error) {
        console.error("Error al registrar el usuario: ", error);
        this.__mensajesService.lanzarMensajeError("Error", "Hubo un problema al registrar el usuario. Por favor, inténtalo más tarde.");
        return;
      }
  
      if (idUsuarioCreado !== undefined) {
        try {
          await this._storageService.subirImagen(this.imagenSubida, "fotos-perfil/especialistas", idUsuarioCreado);
          this.__mensajesService.lanzarMensajeExitoso(":)", "El proceso de creación de tu usuario como especialista fue enviado. Debes verificar tu correo electrónico y esperar a que un administrador revise tu solicitud.");
          this._router.navigate(["home"]);
        } catch (error) {
          console.error("Error al subir la imagen: ", error);
          this.__mensajesService.lanzarMensajeError("Error", "El usuario fue creado, pero hubo un problema al subir la imagen de perfil. Por favor, contáctanos para más detalles.");
        }
      }
    } catch (error) {
      console.error("Error inesperado en el proceso de registro: ", error);
      this.__mensajesService.lanzarMensajeError("Error", "Ocurrió un error inesperado. Por favor, inténtalo más tarde.");
    }
  }
}