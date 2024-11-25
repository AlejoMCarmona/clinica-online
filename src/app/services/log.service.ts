import { Injectable } from '@angular/core';
import { FirestoreService } from './firestore.service';
import { Turno } from '../models/turno.interface';
import { LogTurno } from '../models/log-turno.interface';
import { LogIngreso } from '../models/log-ingreso.interface';

@Injectable({
  providedIn: 'root'
})

export class LogService {
    constructor(private _firestoreService: FirestoreService) {}

    public async crearLogIngreso(idUsuario: string, email: string) {
        const logIngreso: LogIngreso = {
          idUsuario: idUsuario,
          emailUsuario: email,
          fecha: this.obtenerFechaActual(),
          hora: this.obtenerHoraActual()
        }

        await this._firestoreService.subirDocumento(logIngreso, "log-ingresos");
    }

    public async crearLogTurno(turno: Turno, estadoAnterior: string) {
        const logTurno: LogTurno = {
            idTurno: turno.id!,
            especialidad: turno.especialidad,
            estadoAnterior: estadoAnterior,
            estadoNuevo: turno.estado,
            nombreEspecialista: turno.nombreEspecialista,
            nombrePaciente: turno.nombrePaciente,
            fecha: this.obtenerFechaActual()
        };
        
        await this._firestoreService.subirDocumento(logTurno, "log-turnos");
    }

    private obtenerFechaActual(): string {
        const fecha = new Date();
        const año = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const día = String(fecha.getDate()).padStart(2, '0');
        return `${año}-${mes}-${día}`;
    }
    
    private obtenerHoraActual(): string {
        const fecha = new Date();
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        return `${horas}:${minutos}`;
    }
}