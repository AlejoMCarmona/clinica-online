import { Component, Input, OnInit } from '@angular/core';
import { Turno } from '../../../models/turno.interface';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'informe-turnos-por-medico-en-lapso',
  standalone: true,
  imports: [ NgxChartsModule, FormsModule ],
  templateUrl: './informe-turnos-por-medico-en-lapso.component.html',
  styleUrl: './informe-turnos-por-medico-en-lapso.component.css'
})

export class InformeTurnosPorMedicoEnLapsoComponent implements OnInit {
  @Input() turnos!: Turno[];
  public fechaInicio!: string;
  public fechaFin!: string;
  public dataGrafico: any[] = [];
  public view: [number, number] = [700, 400];

  ngOnInit(): void {
    this.fechaInicio = this.cambiarFecha(new Date(Date.now()), -14);
    this.fechaFin = this.cambiarFecha(new Date(Date.now()), 14);
    this.generarDatosGrafico();
  }

  public cambiarFecha(fecha: Date, dias: number): string {
    const nuevaFecha = new Date(fecha);
    nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    const año = nuevaFecha.getFullYear();
    const mes = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
    const dia = String(nuevaFecha.getDate()).padStart(2, '0');
    return `${año}-${mes}-${dia}`;
  }

  public generarDatosGrafico(): void {
    const turnosFiltrados = this.turnos.filter(turno => {
      const fechaTurno = new Date(turno.fecha).getTime();
      const inicio = new Date(this.fechaInicio).getTime();
      const fin = new Date(this.fechaFin).getTime();
      return fechaTurno >= inicio && fechaTurno <= fin && (turno.estado === 'solicitado' || turno.estado === 'realizado');
    });

    const turnosPorMedico = turnosFiltrados.reduce((acc, turno) => {
      acc[turno.nombreEspecialista] = (acc[turno.nombreEspecialista] || 0) + 1;
      return acc;
    }, {} as { [nombreEspecialista: string]: number });

    this.dataGrafico = Object.entries(turnosPorMedico).map(([nombreEspecialista, cantidad]) => ({
      name: nombreEspecialista,
      value: cantidad
    }));
  }
}
