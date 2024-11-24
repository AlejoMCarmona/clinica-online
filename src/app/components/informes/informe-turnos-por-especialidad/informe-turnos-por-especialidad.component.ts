import { Component, Input } from '@angular/core';
import { Turno } from '../../../models/turno.interface';

@Component({
  selector: 'app-informe-turnos-por-especialidad',
  standalone: true,
  imports: [],
  templateUrl: './informe-turnos-por-especialidad.component.html',
  styleUrl: './informe-turnos-por-especialidad.component.css'
})

export class InformeTurnosPorEspecialidadComponent {
  @Input() turnos!: Turno[];

  public obtenerTurnosPorEspecialidad(): { [especialidad: string]: number } {
    return this.turnos.reduce((acc, turno) => {
      acc[turno.especialidad] = (acc[turno.especialidad] || 0) + 1;
      return acc;
    }, {} as { [especialidad: string]: number });
  }
}
