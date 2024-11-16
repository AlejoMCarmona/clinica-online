import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TurnoConAcciones } from '../interfaces/turno-con-acciones.interface';

@Component({
  selector: 'filtro-turnos-paciente',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './filtro-turnos-paciente.component.html',
  styleUrl: './filtro-turnos-paciente.component.css'
})

export class FiltroTurnosPacienteComponent {
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
  aplicarFiltro() {
    const filtroLower = this.filtro.toLowerCase();
    if (filtroLower) {
      this.turnosFiltrados = this.turnosOriginales.filter(turno =>
        turno.especialidad.toLowerCase().includes(filtroLower) ||
        turno.nombreEspecialista.toLowerCase().includes(filtroLower)
      );
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