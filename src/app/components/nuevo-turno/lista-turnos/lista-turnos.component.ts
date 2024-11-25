import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { TablaInteractivaBase } from '../../../shared/interfaces/tabla-interactiva-base';
import { Horario } from '../interfaces/horario.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { Especialista, InformacionEspecialidades } from '../../../models/especialista.interface';
import { Turno } from '../../../models/turno.interface';
import { FirestoreService } from '../../../services/firestore.service';
import { DisableSelectionDirective } from '../../../directives/disable-selection.directive';
import { HoraPipe } from '../../../pipes/hora.pipe';

@Component({
  selector: 'lista-turnos',
  standalone: true,
  imports: [ CommonModule, DisableSelectionDirective, HoraPipe ],
  outputs: [ 'filaSeleccionada' ],
  templateUrl: './lista-turnos.component.html',
  styleUrl: './lista-turnos.component.css'
})

export class ListaTurnosComponent extends TablaInteractivaBase<Horario> {
  @Input() public especialista!: Usuario;
  @Input() public especialidad!: InformacionEspecialidades;
  public turnoSeleccionado!: Horario;

  constructor(private _firestoreService: FirestoreService) {
    super();
  }

  public obtenerInformacion(): void {
    if (!this.especialista || !this.especialidad) {
      return;
    }
    this.cargarTurnosEspecialista();
  }

  public seleccionarTurno(turno: Horario): void {
    this.turnoSeleccionado = turno;
    super.seleccionarFila(turno);
  }

  public async cargarTurnosEspecialista(): Promise<void> {
    const especialista = this.especialista;
    const especialidad = this.especialidad;

    if (!especialista) return;
    const especialistaInformacion = especialista?.informacion as Especialista;

    const turnosTomados: Turno[] = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idEspecialista", especialista.id!) || [];
  
    if (!especialidad || !especialidad.horariosDisponibilidad || !especialidad.duracionTurno) return;

    // Definimos el horario de la clínica (general) y la duración del turno en minutos
    const clinicaHorarios = {
      lunesViernes: { desde: '08:00', hasta: '19:00' },
      sabado: { desde: '08:00', hasta: '14:00' }
    };
  
    const ahora = new Date(); // Fecha actual para iniciar el cálculo
    const milisegundosEnMinuto = 60000;
  
    this.listaElementos = [];  // Limpiamos la lista de turnos disponibles
    for (let i = 0; i < 15; i++) {  // Iteramos sobre los próximos 15 días
      const dia = new Date(ahora);
      dia.setDate(ahora.getDate() + i);
      const diaActual = dia.getDay();  // Obtenemos el día actual de la semana (0 = Domingo, 6 = Sábado)  
      const esDiaHabil = diaActual >= 1 && diaActual <= 6; // Verificamos si el día es hábil (lunes a viernes o sábado)
      if (!esDiaHabil) continue; // Solo procesamos días hábiles

      const diasQueTrabajaElEspecialista = this.obtenerDiasTrabajo(especialistaInformacion, especialidad.nombre);
  
      if (!diasQueTrabajaElEspecialista.includes(diaActual)) continue; // Solo se calculan turnos en los días que trabaja el especialista

      // Obtenemos el horario del especialista en el día específico
      const horarioDia = diaActual === 6 ? clinicaHorarios.sabado : clinicaHorarios.lunesViernes; 
      const disponibilidadDelEspecialistaEnElDia = especialidad.horariosDisponibilidad.find(d => d.dia == diaActual);

      if (!disponibilidadDelEspecialistaEnElDia) continue;

      const inicioTrabajo = this.convertirHoraADate(dia, disponibilidadDelEspecialistaEnElDia.desde > horarioDia.desde ? disponibilidadDelEspecialistaEnElDia.desde : horarioDia.desde);
      const finTrabajo = this.convertirHoraADate(dia, disponibilidadDelEspecialistaEnElDia.hasta < horarioDia.hasta ? disponibilidadDelEspecialistaEnElDia.hasta : horarioDia.hasta);
  
      // Generamos los turnos dentro del rango de trabajo
      let turno = new Date(inicioTrabajo);
      while (turno < finTrabajo) {
        const finTurno = new Date(turno.getTime() + especialidad.duracionTurno * milisegundosEnMinuto);
  
        // Verificamos si el turno ya fue tomado
        const turnoOcupado = turnosTomados.some(t => t.fecha === dia.toISOString().split('T')[0] && t.hora === turno.toTimeString().split(' ')[0]);
        const horario = {
          fecha: dia.toISOString().split('T')[0],
          hora: turno.toTimeString().split(' ')[0],
          disponible: !turnoOcupado
        };
        this.listaElementos.push(horario);
  
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
}
