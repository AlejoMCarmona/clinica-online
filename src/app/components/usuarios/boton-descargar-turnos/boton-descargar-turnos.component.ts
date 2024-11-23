import { Component, Input } from '@angular/core';
import * as XLSX from 'xlsx';
import { FirestoreService } from '../../../services/firestore.service';
import { Usuario } from '../../../models/usuarios.interface';
import { Turno } from '../../../models/turno.interface';
import { MensajesService } from '../../../services/mensajes.service';

@Component({
  selector: 'boton-descargar-turnos',
  standalone: true,
  imports: [],
  templateUrl: './boton-descargar-turnos.component.html',
  styleUrl: './boton-descargar-turnos.component.css'
})

export class BotonDescargarTurnosComponent {
  @Input() usuario!: Usuario; // Usuario cuyos turnos serán exportados a un archivo Excel.
  @Input() esEspecialista!: boolean;

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService) {}

  /**
   * Genera y descarga un archivo Excel con los turnos del usuario.
   */
  public async descargarExcel() {
    if (!this.usuario) {
      return;
    }

    let datos: any[] = [];
    // Define los datos a exportar
    if (this.esEspecialista) {
      const turnosEspecialista: Turno[] = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idEspecialista", this.usuario.id!);

      if (turnosEspecialista.length == 0) {
        this._mensajesService.lanzarNotificacionErrorCentro("El especialista seleccionado aún no posee turnos");
        return;
      }

      datos = turnosEspecialista.map(turno => ({
        Fecha: turno.fecha,
        Hora: turno.hora,
        Especialidad: turno.especialidad,
        Paciente: turno.nombrePaciente,
        Estado: turno.estado
      }));
    } else {
      const turnosPaciente: Turno[] = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idPaciente", this.usuario.id!);

      if (turnosPaciente.length == 0) {
        this._mensajesService.lanzarNotificacionErrorCentro("El paciente seleccionado aún no ha solicitado turnos");
        return;
      }

      datos = turnosPaciente.map(turno => ({
        Fecha: turno.fecha,
        Hora: turno.hora,
        Especialidad: turno.especialidad,
        Especialista: turno.nombreEspecialista,
        Estado: turno.estado
      }));
    }

    // Crea una worksheet
    const hojaTrabajo = XLSX.utils.json_to_sheet(datos);

    // Crea workbook y lo agrega
    const libroTrabajo: XLSX.WorkBook = {
      Sheets: { Turnos: hojaTrabajo },
      SheetNames: ['Turnos'],
    };

    // Genera el archivo Excel y lo descarga
    const nombreArchivo = `turnos_${this.usuario.informacion.nombre}-${this.usuario.informacion.apellido}.xlsx`;
    XLSX.writeFile(libroTrabajo, nombreArchivo);
  }
}
