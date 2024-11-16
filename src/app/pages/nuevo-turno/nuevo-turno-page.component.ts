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

@Component({
  selector: 'app-nuevo-turno',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, ListaEspecialidadesComponent, ListaEspecialistasComponent, ListaTurnosComponent ],
  templateUrl: './nuevo-turno-page.component.html',
  styleUrl: './nuevo-turno-page.component.css'
})

export class NuevoTurnoPageComponent {
  public turnoForm!: FormGroup;
  public especialidades: Especialidad[] = [];
  public especialistas: Usuario[] = [];
  public pacientes!: Usuario[];

  public diasDisponibles: string[] = [];
  public horariosDisponibles: any[] = [];
  public turnosEspecialista: Turno[] = [];
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
    this.generarProximos15Dias();
    this.usuarioRol = await this._authService.obtenerRol();
    if (this.usuarioRol == "admin") {
      this.pacientes = await this._firestoreService.obtenerDocumentosPorCampo("usuarios", "rol", "paciente");
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

  public generarProximos15Dias(): void {
    // Genera los próximos 15 días hábiles (lunes a viernes)
    const hoy = new Date();
    for (let i = 0; i < 15; i++) {
      const fecha = new Date(hoy);
      fecha.setDate(hoy.getDate() + i);
      if (fecha.getDay() !== 0 && fecha.getDay() !== 6) { // Excluye sábados y domingos
        this.diasDisponibles.push(fecha.toLocaleDateString());
      }
    }
  }

  public async seleccionarEspecialidad(especialidad: any) {
    this.especialidad?.setValue(especialidad.nombre);
  }

  public async seleccionarEspecialista(especialista: any) {
    this.especialista?.setValue(especialista);
  }

  public async seleccionarTurno(turno: any) {
    this.dia?.setValue(turno);
  }

  // Método para enviar el formulario
  public async cargarTurno(): Promise<void> {
    if (!this.turnoForm.valid) {
      this.turnoForm.markAllAsTouched();
    }

    try {
      let idPaciente = "";
      if (this.usuarioRol == "admin") {
        idPaciente = this.paciente?.value;
      } else {
        idPaciente = await this._authService.obtenerIdUsuario();
      }

      let paciente: Usuario | undefined;
      if (this.usuarioRol == "admin") {
        paciente = this.pacientes.find(p => p.id == idPaciente);
      } else {
        paciente = await this._firestoreService.obtenerDocumentosPorID("usuarios", idPaciente) as Usuario;
      }

      const especialistaDelTurno: Usuario = this.especialista?.value;
      const horarioDelTurno: Horario = this.dia?.value;

      const nuevoTurno: Turno = {
        idEspecialista: especialistaDelTurno.id!,
        nombreEspecialista: especialistaDelTurno.informacion.nombre! + " " + especialistaDelTurno.informacion.apellido!,
        estado: "solicitado",
        fecha: horarioDelTurno.fecha,
        hora: horarioDelTurno.hora,
        especialidad: this.especialidad?.value,
        idPaciente: idPaciente,
        nombrePaciente: paciente?.informacion.nombre! + " " + paciente?.informacion.apellido!
      }

      await this._firestoreService.subirDocumento(nuevoTurno, "turnos");
      this._mensajesService.lanzarMensajeExitoso(":)", "¡Tu turno fue creado con éxito!");
      this._router.navigate(["home"]);
    }
    catch (error) {
      console.log(error);
      this._mensajesService.lanzarMensajeError(":)", "Hubo un error durante la creación de tu turno, reintentalo más tarde.");
    }
  }
}