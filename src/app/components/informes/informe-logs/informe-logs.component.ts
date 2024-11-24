import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { LogIngreso } from '../../../models/log-ingreso.interface';

@Component({
  selector: 'informe-logs',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './informe-logs.component.html',
  styleUrl: './informe-logs.component.css'
})

export class InformeLogsComponent {
  public logs: LogIngreso[] = [];

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit(): Promise<void> {
    await this.obtenerLogs();
  }

  /**
   * Obtiene los logs de ingresos desde Firebase y los almacena en la variable `logs`.
   */
  async obtenerLogs(): Promise<void> {
    this.logs = await this.firestoreService.obtenerDocumentos('log-ingresos');
  }
}
