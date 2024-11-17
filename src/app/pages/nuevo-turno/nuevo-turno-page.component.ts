import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Usuario } from '../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { Especialidad } from '../../models/especialidades.interface';
import { Turno } from '../../models/turno.interface';
import { AuthService } from '../../services/auth.service';
import { MensajesService } from '../../services/mensajes.service';
import { Router } from '@angular/router';
import { ListaEspecialidadesComponent } from '../../components/nuevo-turno/lista-especialidades/lista-especialidades.component';
import { ListaEspecialistasComponent } from '../../components/nuevo-turno/lista-especialistas/lista-especialistas.component';
import { ListaTurnosComponent } from '../../components/nuevo-turno/lista-turnos/lista-turnos.component';
import { Horario } from '../../components/nuevo-turno/interfaces/horario.interface';
import { ListaPacientesComponent } from '../../components/nuevo-turno/lista-pacientes/lista-pacientes.component';
import { InformacionEspecialidades } from '../../models/especialista.interface';

@Component({
  selector: 'app-nuevo-turno',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, ListaEspecialidadesComponent, ListaEspecialistasComponent, ListaTurnosComponent, ListaPacientesComponent ],
  templateUrl: './nuevo-turno-page.component.html',
  styleUrl: './nuevo-turno-page.component.css'
})

export class NuevoTurnoPageComponent {
  public turnoForm!: FormGroup;
  public usuarioRol!: string;

  constructor(private fb: FormBuilder, private _firestoreService: FirestoreService, private _authService: AuthService, private _mensajesService: MensajesService, private _router: Router) {
    this.turnoForm = this.fb.group({
      especialidad: ['', Validators.required],
      especialista: ['', Validators.required],
      dia: ['', Validators.required],
      paciente: ['']
    });
  }

  async ngOnInit(): Promise<void> {
    this.usuarioRol = await this._authService.obtenerRol();
    if (this.usuarioRol == "admin") {
      // Hacer que el campo 'paciente' sea obligatorio si el usuario es admin
      this.paciente?.setValidators(Validators.required);
      this.paciente?.updateValueAndValidity();
    }
  }

  // Getters para los campos del formulario
  get especialidad() {
    return this.turnoForm.get('especialidad');
  }

  get especialista() {
    return this.turnoForm.get('especialista');
  }

  get dia() {
    return this.turnoForm.get('dia');
  }
  
  get paciente() {
    return this.turnoForm.get('paciente');
  }

  public async seleccionarEspecialista(especialista: any) {
    this.especialista?.setValue(especialista);
    // Resetear las selecciones siguientes.
  }

  public async seleccionarEspecialidad(especialidad: any) {
    this.especialidad?.setValue(especialidad);
    // Resetear las selecciones siguientes.
    this.dia?.setValue(null);
    this.paciente?.setValue(null);
  }

  public async seleccionarTurno(turno: any) {
    this.dia?.setValue(turno);
  }

  public async seleccionarPaciente(paciente: any) {
    this.paciente?.setValue(paciente);
  }

  public formatearHora(turno: Horario): string {
    const fecha = new Date(`${turno.fecha}T${turno.hora}`);
    const dia = fecha.getDate().toString().padStart(2, '0');
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const horas = fecha.getHours().toString().padStart(2, '0');
    const minutos = fecha.getMinutes().toString().padStart(2, '0');
    return `${dia}-${mes} ${horas}:${minutos}`;
  }

  public irAtras(): void {
    if (this.paciente?.value) {
      this.paciente?.setValue(null);
    } else if (this.dia?.value) {
      this.dia?.setValue(null);
    } else if (this.especialidad?.value) {
      this.especialidad?.setValue(null);
    } else if (this.especialista?.value) {
      this.especialista?.setValue(null);
    }
  }

  // Método para enviar el formulario
  public async cargarTurno(): Promise<void> {
    if (!this.turnoForm.valid) {
      this.turnoForm.markAllAsTouched();
    }

    try {
      let paciente: Usuario | undefined;
      if (this.usuarioRol != "admin") {
        const idUsuario = await this._authService.obtenerIdUsuario();
        paciente = await this._firestoreService.obtenerDocumentosPorID("usuarios", idUsuario) as Usuario;
      } else {
        paciente = this.paciente?.value;
      }

      const especialistaDelTurno: Usuario = this.especialista?.value;
      const horarioDelTurno: Horario = this.dia?.value;
      const especialidadDelTurno: InformacionEspecialidades = this.especialidad?.value;

      const nuevoTurno: Turno = {
        idEspecialista: especialistaDelTurno.id!,
        nombreEspecialista: especialistaDelTurno.informacion.nombre! + " " + especialistaDelTurno.informacion.apellido!,
        estado: "solicitado",
        fecha: horarioDelTurno.fecha,
        hora: horarioDelTurno.hora,
        especialidad: especialidadDelTurno.nombre,
        idPaciente: paciente?.id!,
        nombrePaciente: paciente?.informacion.nombre! + " " + paciente?.informacion.apellido!
      }

      await this._firestoreService.subirDocumento(nuevoTurno, "turnos");
      this._mensajesService.lanzarMensajeExitoso(":)", "¡Tu turno fue creado con éxito!");
      this._router.navigate(["home"]);
    }
    catch (error) {
      this._mensajesService.lanzarMensajeError(":)", "Hubo un error durante la creación de tu turno, reintentalo más tarde.");
    }
  }
}