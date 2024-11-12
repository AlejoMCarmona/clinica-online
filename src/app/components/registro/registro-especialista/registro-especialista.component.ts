import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { Especialista, InformacionEspecialidades } from '../../../models/especialista.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { StorageService } from '../../../services/storage.service';
import { Especialidad } from '../../../models/especialidades.interface';
import { CaptchaComponent } from '../../captcha/captcha/captcha.component';

@Component({
  selector: 'registro-especialista',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule, CaptchaComponent ],
  templateUrl: './registro-especialista.component.html',
  styleUrl: './registro-especialista.component.css'
})

export class RegistroEspecialistaComponent implements OnInit {
  public especialistaFormulario!: FormGroup;
  public captchaValido: boolean = false;
  public listaEspecialidades: string[] = []; // Lista de especialidades que se muestra en pantalla en todo momento (incluye las nuevas agregadas)
  public listaEspecialidadesInicial: string[] = []; // Lista de especialidades iniciales (que se obtienen de la base de datos)
  public imagenSubida!: File;
  public estaCargando: boolean = false;
  @Output() registroCompletado = new EventEmitter<void>();

  constructor(private fb: FormBuilder, private _firestoreService: FirestoreService, private __mensajesService: MensajesService, private _authService: AuthService, private _router: Router, private _storageService: StorageService) {
    this.especialistaFormulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.pattern('^[A-Za-z]+( [A-Za-z]+)*$')]],
      apellido: ['', [Validators.required, Validators.pattern('^[A-Za-z]+( [A-Za-z]+)*$')]],
      edad: ['', [Validators.required, Validators.min(21), Validators.max(120)]],
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
    this.listaEspecialidadesInicial = Array.from(this.listaEspecialidades);
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
      this.nuevaEspecialidad.reset();
    }
  }
  private obtenerNuevasEspecialidades(): Especialidad[] {
    let nuevasEspecialidades: Especialidad[] = [];
    let especialidadesElegidas: string[] = this.especialidades.value;
    especialidadesElegidas.forEach(especialidad => {
      if (!this.listaEspecialidadesInicial.includes(especialidad)) {
        nuevasEspecialidades.push({ nombre: especialidad });
      };
    });
    return nuevasEspecialidades;
  }

  public async registrarEspecialista() {
    try {
      if (!this.especialistaFormulario.valid) {
        this.especialistaFormulario.markAllAsTouched();
        return;
      }
      if (!this.captchaValido) {
        this.__mensajesService.lanzarMensajeError("ERROR", "Debes completar el captcha correctamente");
        return;
      }

      this.estaCargando = true;
      const nuevasEspecialidades = this.obtenerNuevasEspecialidades();
      if (nuevasEspecialidades.length > 0) {
        try {
          await this._firestoreService.subirDocumentos(nuevasEspecialidades, "especialidades");
        } catch (error) {
          console.error("Error al subir las nuevas especialidades: ", error);
          this.__mensajesService.lanzarMensajeError("Error", "Hubo un problema al agregar la nueva especialidad. Por favor, inténtalo más tarde.");
          return;
        }
      }
  
      const especialidades = this.especialidades.value as string[];
      let informacionEspecialidades: InformacionEspecialidades[] = [];
      especialidades.forEach(e => {
        informacionEspecialidades.push({
          nombre: e,
          duracionTurno: 30,
          informacionCompletada: false
        });
      });

      const especialista: Especialista = {
        nombre: this.nombre?.value,
        apellido: this.apellido?.value,
        edad: this.edad?.value,
        dni: this.dni?.value,
        especialidades: informacionEspecialidades
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
          this.especialistaFormulario.reset();
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