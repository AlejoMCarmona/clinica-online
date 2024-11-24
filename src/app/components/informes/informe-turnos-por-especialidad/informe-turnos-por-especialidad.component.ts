import { Component, Input, OnInit } from '@angular/core';
import { Turno } from '../../../models/turno.interface';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'informe-turnos-por-especialidad',
  standalone: true,
  imports: [ NgxChartsModule ],
  templateUrl: './informe-turnos-por-especialidad.component.html',
  styleUrl: './informe-turnos-por-especialidad.component.css'
})

export class InformeTurnosPorEspecialidadComponent implements OnInit {
  @Input() turnos!: Turno[];

  public chartData: { name: string; value: number }[] = [];
  public view: [number, number] = [0, 300]; // Tamaño del gráfico

  ngOnInit(): void {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    const turnosPorEspecialidad = this.obtenerTurnosPorEspecialidad();
    this.chartData = Object.keys(turnosPorEspecialidad).map(especialidad => ({
      name: especialidad,
      value: turnosPorEspecialidad[especialidad],
    }));
  }

  private obtenerTurnosPorEspecialidad(): { [especialidad: string]: number } {
    return this.turnos.reduce((acc, turno) => {
      acc[turno.especialidad] = (acc[turno.especialidad] || 0) + 1;
      return acc;
    }, {} as { [especialidad: string]: number });
  }
}
