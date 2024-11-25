import { Component, Input, OnInit } from '@angular/core';
import { Turno } from '../../../models/turno.interface';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@Component({
  selector: 'informe-turnos-por-dia',
  standalone: true,
  imports: [ NgxChartsModule ],
  templateUrl: './informe-turnos-por-dia.component.html',
  styleUrl: './informe-turnos-por-dia.component.css'
})

export class InformeTurnosPorDiaComponent implements OnInit {
  @Input() turnos!: Turno[];
  public chartData: { name: string; value: number }[] = [];
  public view: [number, number] = [1000, 0]; // Tamaño del gráfico

  ngOnInit(): void {
    this.cargarDatos();
  }
  
  public cargarDatos() {
    const turnosPorDia = this.obtenerTurnosPorDia();
    this.chartData = Object.keys(turnosPorDia).map(dia => ({
      name: dia.charAt(0).toUpperCase() + dia.slice(1),
      value: turnosPorDia[dia],
    }));
  }

  public obtenerTurnosPorDia() {
    return this.turnos.reduce((acc, turno) => {
      const nombreDia = this.obtenerDiaSemana(turno.fecha);
      acc[nombreDia] = (acc[nombreDia] || 0) + 1;
      return acc;
    }, {} as { [dia: string]: number });
  }

  private obtenerDiaSemana(fecha: string): string {
    const diasSemana = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo'];
    const fechaObjeto = new Date(fecha);
    if (isNaN(fechaObjeto.getTime())) {
      throw new Error('La fecha proporcionada no es válida');
    }
    const diaSemana = fechaObjeto.getDay();
    return diasSemana[diaSemana];
  }
}

