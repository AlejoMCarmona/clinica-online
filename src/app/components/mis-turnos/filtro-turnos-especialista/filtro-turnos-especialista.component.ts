import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TurnoConAcciones } from '../interfaces/turno-con-acciones.interface';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'filtro-turnos-especialista',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './filtro-turnos-especialista.component.html',
  styleUrl: './filtro-turnos-especialista.component.css'
})

export class FiltroTurnosEspecialistaComponent {
  @Input() set turnos(value: TurnoConAcciones[]) {
    // Mantén una copia de la lista original y actualiza el filtro inicial
    this.turnosOriginales = value || [];
    this.turnosFiltrados = [...this.turnosOriginales];
    this.enviarListaFiltrada();
  }
  @Output() listaFiltrada = new EventEmitter<TurnoConAcciones[]>();
  private turnosOriginales: TurnoConAcciones[] = [];
  private turnosFiltrados: TurnoConAcciones[] = [];
  public filtro: string = '';

// Método para aplicar el filtro
public aplicarFiltro() {
  const filtroLower = this.filtro.toLowerCase();
  if (filtroLower) {
    this.turnosFiltrados = this.turnosOriginales.filter(turno => {
      // Convertimos los datos de turno y datos fijos de la historia clínica en un solo string para buscar
      const datosFijosTurno = `
        ${turno.especialidad}
        ${turno.nombreEspecialista}
        ${turno.nombrePaciente}
        ${turno.estado}
        ${turno.fecha}
        ${turno.hora}
        ${turno.comentariosEspecialista?.comentario || ''}
        ${turno.comentariosEspecialista?.diagnostico || ''}
      `.toLowerCase();

      const datosFijosHistoriaClinica = turno.historiaClinica
        ? `
          ${turno.historiaClinica.fechaTurno}
          ${turno.historiaClinica.altura || ''}
          ${turno.historiaClinica.peso || ''}
          ${turno.historiaClinica.temperatura || ''}
          ${turno.historiaClinica.presionArterial || ''}
        `.toLowerCase()
        : '';

      // Convertimos los datos dinámicos en un string
      const datosDinamicosHistoria = turno.historiaClinica?.datosDinamicos
      ? JSON.stringify(turno.historiaClinica.datosDinamicos).toLowerCase()
      : '';
      // Combinamos todo y aplicamos el filtro
      return (
        datosFijosTurno.includes(filtroLower) || 
        datosFijosHistoriaClinica.includes(filtroLower) || 
        datosDinamicosHistoria.includes(filtroLower)
      );
    });
  } else {
    // Restauramos la lista completa si el filtro está vacío
    this.turnosFiltrados = [...this.turnosOriginales];
  }

  // Emitimos la lista filtrada
  this.enviarListaFiltrada();
}

  // Método para emitir la lista filtrada
  private enviarListaFiltrada() {
    this.listaFiltrada.emit(this.turnosFiltrados);
  }
}
