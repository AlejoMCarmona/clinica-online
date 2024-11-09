import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FirestoreService } from '../../services/firestore.service';
import { Usuario } from '../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { Especialidad } from '../../models/especialidades.interface';
import { Especialista } from '../../models/especialista.interface';
import { Turno } from '../../models/turno.interface';
import { AuthService } from '../../services/auth.service';
import { MensajesService } from '../../services/mensajes.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nuevo-turno',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './nuevo-turno-page.component.html',
  styleUrl: './nuevo-turno-page.component.css'
})
export class NuevoTurnoPageComponent {
  public turnoForm!: FormGroup;
  public especialidades: Especialidad[] = [];
  public especialistas: Usuario[] = [];
  public diasDisponibles: string[] = [];
  public horariosDisponibles: any[] = [];
  public turnosEspecialista: Turno[] = [];

  constructor(private fb: FormBuilder, private _firestoreService: FirestoreService, private _authService: AuthService, private _mensajesService: MensajesService, private _router: Router) {
    this.turnoForm = this.fb.group({
      especialidad: ['', Validators.required],
      especialista: ['', Validators.required],
      dia: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.generarProximos15Dias();
    this.obtenerEspecialidades();
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

  // Me debe retornar un array con los horariosDisponibles para cada especialista
  public async obtenerEspecialistas(especialidadSeleccionada: string) {
    const especialistas = await this._firestoreService.obtenerDocumentosPorCampo("usuarios", "rol", "especialista");
    const especialistasObtenidos: Usuario[] = [];

    especialistas.forEach(e => {
      let informacion = e.informacion as Especialista;
      informacion.especialidades.forEach(especialidad => {
        if (especialidad.nombre == especialidadSeleccionada && especialidad.informacionCompletada) {
          especialistasObtenidos.push(e);
        }
      });
    });

    return especialistasObtenidos;
  }

  public async cargarEspecialistas(): Promise<void> {
    this.especialistas = await this.obtenerEspecialistas(this.especialidad?.value);
  }

  public obtenerEspecialidades() {
    this._firestoreService.obtenerDocumentos("especialidades", "nombre", "asc")
    .then(especialidades => {
      this.especialidades = especialidades;
    });
  }

  public async cargarTurnosEspecialista(): Promise<void> {
    const idEspecialista = this.especialista?.value;
    const especialidad = this.especialidad?.value;
    this.horariosDisponibles = [];  // Limpiamos la lista de turnos disponibles

    const usuarioEspecialista: Usuario | undefined = this.especialistas.find(e => e.id === idEspecialista && e.rol === 'especialista'); // Buscamos el especialista correspondiente y obtenemos la especialidad seleccionada
    if (!usuarioEspecialista) return;
    const especialista = usuarioEspecialista?.informacion as Especialista;

    const turnosTomados: Turno[] = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idEspecialista", idEspecialista) || [];
  
    const informacionEspecialidadSeleccionada = especialista.especialidades.find(es => es.nombre === especialidad);
    if (!informacionEspecialidadSeleccionada || !informacionEspecialidadSeleccionada.horariosDisponibilidad || !informacionEspecialidadSeleccionada.duracionTurno) return;

    // Definimos el horario de la clínica (general) y la duración del turno en minutos
    const clinicaHorarios = {
      lunesViernes: { desde: '08:00', hasta: '19:00' },
      sabado: { desde: '08:00', hasta: '14:00' }
    };
  
    const ahora = new Date(); // Fecha actual para iniciar el cálculo
    const milisegundosEnMinuto = 60000;
  
    for (let i = 0; i < 15; i++) {  // Iteramos sobre los próximos 15 días
      const dia = new Date(ahora);
      dia.setDate(ahora.getDate() + i);
      const diaActual = dia.getDay();  // Obtenemos el día actual de la semana (0 = Domingo, 6 = Sábado)  
      const esDiaHabil = diaActual >= 1 && diaActual <= 6; // Verificamos si el día es hábil (lunes a viernes o sábado)
      if (!esDiaHabil) continue; // Solo procesamos días hábiles

      const diasQueTrabajaElEspecialista = this.obtenerDiasTrabajo(especialista, especialidad);
  
      if (!diasQueTrabajaElEspecialista.includes(diaActual)) continue; // Solo se calculan turnos en los días que trabaja el especialista

      // Obtenemos el horario del especialista en el día específico
      const horarioDia = diaActual === 6 ? clinicaHorarios.sabado : clinicaHorarios.lunesViernes; 
      const disponibilidadDelEspecialistaEnElDia = informacionEspecialidadSeleccionada.horariosDisponibilidad.find(d => d.dia == diaActual);

      if (!disponibilidadDelEspecialistaEnElDia) continue;

      const inicioTrabajo = this.convertirHoraADate(dia, disponibilidadDelEspecialistaEnElDia.desde > horarioDia.desde ? disponibilidadDelEspecialistaEnElDia.desde : horarioDia.desde);
      const finTrabajo = this.convertirHoraADate(dia, disponibilidadDelEspecialistaEnElDia.hasta < horarioDia.hasta ? disponibilidadDelEspecialistaEnElDia.hasta : horarioDia.hasta);
  
      // Generamos los turnos de media hora en media hora dentro del rango de trabajo
      let turno = new Date(inicioTrabajo);
      while (turno < finTrabajo) {
        const finTurno = new Date(turno.getTime() + informacionEspecialidadSeleccionada.duracionTurno * milisegundosEnMinuto);
  
        // Verificamos si el turno ya fue tomado
        const turnoOcupado = turnosTomados.some(t => t.fecha === dia.toISOString().split('T')[0] && t.hora === turno.toTimeString().split(' ')[0]);
        const horario = {
          fecha: dia.toISOString().split('T')[0],
          hora: turno.toTimeString().split(' ')[0],
          disponible: !turnoOcupado
        };
        this.horariosDisponibles.push(horario);
  
        // Avanzamos al siguiente turno en el tiempo
        turno = finTurno;
      }
    }
  }
  
  /**
   * Convierte una hora en formato string (HH:mm) en un objeto Date para un día específico.
   * 
   * @param fechaBase - La fecha base para definir el día del turno.
   * @param horaStr - La hora en formato "HH:mm" que será convertida.
   * @returns Un objeto Date con la fecha y hora combinadas.
   */
  private convertirHoraADate(fechaBase: Date, horaStr: string): Date {
    const [horas, minutos] = horaStr.split(':').map(Number);
    const fechaHora = new Date(fechaBase);
    fechaHora.setHours(horas, minutos, 0, 0);
    return fechaHora;
  }

  private obtenerDiasTrabajo(especialista: Especialista, especialidadNombre: string): number[] {
    const especialidad = especialista.especialidades.find(especialidad => especialidad.nombre === especialidadNombre);
    if (!especialidad || !especialidad.horariosDisponibilidad) {
      return [];
    }
    return especialidad.horariosDisponibilidad.map(horario => horario.dia);
  }

  // Método para enviar el formulario
  public async cargarTurno(): Promise<void> {
    if (!this.turnoForm.valid) {
      this.turnoForm.markAllAsTouched();
    }

    try {
      const idPaciente = await this._authService.obtenerIdUsuario();
      const nuevoTurno: Turno = {
        idEspecialista: this.especialista?.value,
        estado: "solicitado",
        fecha: this.dia?.value.fecha,
        hora: this.dia?.value.hora,
        especialidad: this.especialidad?.value,
        idPaciente: idPaciente
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