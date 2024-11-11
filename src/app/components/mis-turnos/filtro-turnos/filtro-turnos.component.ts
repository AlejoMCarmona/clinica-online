import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Turno } from '../../../models/turno.interface';

@Component({
  selector: 'filtro-turnos',
  standalone: true,
  imports: [ FormsModule ],
  templateUrl: './filtro-turnos.component.html',
  styleUrl: './filtro-turnos.component.css'
})

export class FiltroTurnosComponent {
  @Input() turnosIniciales: any[] = [];
  @Output() turnosFiltrados: EventEmitter<any[]> = new EventEmitter<any[]>();
  public filtro: string = "";

  constructor() { }

  ngOnInit(): void {
    this.turnosFiltrados.emit([...this.turnosIniciales]);
  }

  public filtrarTurnos(): void {
    const texto = this.filtro.toLowerCase();
    const turnos = this.turnosIniciales.filter(turno => 
      turno.especialidad.toLowerCase().includes(texto)
    );
    this.turnosFiltrados.emit(turnos);
  }
}
