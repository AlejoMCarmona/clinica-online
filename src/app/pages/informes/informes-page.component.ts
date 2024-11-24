import { Component, OnInit } from '@angular/core';
import { InformeLogsComponent } from '../../components/informes/informe-logs/informe-logs.component';
import { InformeTurnosPorEspecialidadComponent } from '../../components/informes/informe-turnos-por-especialidad/informe-turnos-por-especialidad.component';
import { FirestoreService } from '../../services/firestore.service';
import { Turno } from '../../models/turno.interface';
import { CommonModule } from '@angular/common';
import { InformeTurnosPorDiaComponent } from '../../components/informes/informe-turnos-por-dia/informe-turnos-por-dia.component';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [ CommonModule, InformeLogsComponent, InformeTurnosPorEspecialidadComponent, InformeTurnosPorDiaComponent ],
  templateUrl: './informes-page.component.html',
  styleUrl: './informes-page.component.css'
})

export class InformesPageComponent implements OnInit {
  public turnos!: Turno[];
  
  constructor(private firestoreService: FirestoreService) {}
  
  async ngOnInit() {
    this.turnos = await this.firestoreService.obtenerDocumentos("turnos");
  }
}
