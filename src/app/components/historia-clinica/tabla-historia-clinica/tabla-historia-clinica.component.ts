import { Component, Input } from '@angular/core';
import { HistoriaPaciente } from '../../../models/historia-paciente.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'tabla-historia-clinica',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './tabla-historia-clinica.component.html',
  styleUrl: './tabla-historia-clinica.component.css'
})

export class TablaHistoriaClinicaComponent {
  @Input() historiaPaciente!: HistoriaPaciente;

  public obtenerDatosDinamicos(obj: any): string[] {
    return Object.keys(obj);
  }
}
