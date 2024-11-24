import { Component, OnInit } from '@angular/core';
import { InformeLogsComponent } from '../../components/informes/informe-logs/informe-logs.component';
import { InformeTurnosPorEspecialidadComponent } from '../../components/informes/informe-turnos-por-especialidad/informe-turnos-por-especialidad.component';
import { FirestoreService } from '../../services/firestore.service';
import { Turno } from '../../models/turno.interface';
import { CommonModule } from '@angular/common';
import { InformeTurnosPorDiaComponent } from '../../components/informes/informe-turnos-por-dia/informe-turnos-por-dia.component';
import { InformeTurnosPorMedicoEnLapsoComponent } from '../../components/informes/informe-turnos-por-medico-en-lapso/informe-turnos-por-medico-en-lapso.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [ CommonModule, FormsModule, InformeLogsComponent, InformeTurnosPorEspecialidadComponent, InformeTurnosPorDiaComponent, InformeTurnosPorMedicoEnLapsoComponent ],
  templateUrl: './informes-page.component.html',
  styleUrl: './informes-page.component.css'
})

export class InformesPageComponent implements OnInit {
  public turnos!: Turno[];
  public fechaInicio!: Date;
  public fechaFin!: Date;
  
  constructor(private firestoreService: FirestoreService) {}
  
  async ngOnInit() {
    this.turnos = await this.firestoreService.obtenerDocumentos("turnos");
  }
}
