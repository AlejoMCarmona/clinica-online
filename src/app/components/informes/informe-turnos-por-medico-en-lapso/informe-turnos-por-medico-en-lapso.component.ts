import { Component, Input, OnInit } from '@angular/core';
import { Color, ColorHelper, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { FormsModule } from '@angular/forms';
import { LogTurno } from '../../../models/log-turno.interface';

@Component({
  selector: 'informe-turnos-por-medico-en-lapso',
  standalone: true,
  imports: [ NgxChartsModule, FormsModule ],
  templateUrl: './informe-turnos-por-medico-en-lapso.component.html',
  styleUrl: './informe-turnos-por-medico-en-lapso.component.css'
})

export class InformeTurnosPorMedicoEnLapsoComponent implements OnInit {
  @Input() logTurnos!: LogTurno[];
  @Input() estado!: string;
  public fechaInicio!: string;
  public fechaFin!: string;
  public dataGrafico: any[] = [];
  public view: [number, number] = [700, 400];
  private colorScheme: Color = {
    name: 'customScheme',
    selectable: true,
    group: ScaleType.Ordinal,
    domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA'], // Colores de las porciones
  };

  ngOnInit(): void {
    this.fechaInicio = this.cambiarFecha(new Date(Date.now()), -14);
    this.fechaFin = this.cambiarFecha(new Date(Date.now()), 14);
    console.log(this.fechaInicio);
    console.log(this.fechaFin);
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
    const turnosFiltrados = this.logTurnos.filter(turno => {
      const fechaTurno = new Date(turno.fecha).getTime();
      const inicio = new Date(this.fechaInicio).getTime();
      const fin = new Date(this.fechaFin).getTime();
      return fechaTurno >= inicio && fechaTurno <= fin && (turno.estadoNuevo === this.estado);
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

  public formatearLabel(cantidad: any): string {
    return `${cantidad}`;
  }

  public getColor(nombre: string): string {
    this.dataGrafico.forEach(dg => console.log(JSON.stringify(dg))); 
    const colorHelper = new ColorHelper(this.colorScheme, ScaleType.Ordinal, this.dataGrafico.map(d => d.name), this.colorScheme);
    return colorHelper.getColor(nombre);
  }
}
