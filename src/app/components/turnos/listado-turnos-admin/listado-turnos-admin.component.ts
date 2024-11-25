import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Usuario } from '../../../models/usuarios.interface';
import { TurnoConAcciones } from '../../mis-turnos/interfaces/turno-con-acciones.interface';
import { Turno } from '../../../models/turno.interface';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { FormsModule } from '@angular/forms';
import { FiltroTurnosPacienteComponent } from '../../mis-turnos/filtro-turnos-paciente/filtro-turnos-paciente.component';
import { Unsubscribe } from '@angular/fire/auth';
import { LogService } from '../../../services/log.service';
import { OrdenarPorFechaPipe } from '../../../pipes/ordenar-por-fecha.pipe';

@Component({
  selector: 'listado-turnos-admin',
  standalone: true,
  imports: [ CommonModule, FiltroTurnosPacienteComponent, FormsModule, OrdenarPorFechaPipe ],
  templateUrl: './listado-turnos-admin.component.html',
  styleUrl: './listado-turnos-admin.component.css'
})

export class ListadoTurnosAdminComponent implements OnInit, OnDestroy {
  public listadoTurnosConAcciones: TurnoConAcciones[] = [];
  public turnosFiltrados: TurnoConAcciones[] = [];
  public turnoSeleccionado!: Turno;
  public motivoCancelacion: string = "";
  public desuscripcion!: Unsubscribe;
  public ordenAscendente: boolean = false;

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef, private _logService: LogService) {}

  async ngOnInit(): Promise<void> {
    this.desuscripcion = this._firestoreService.obtenerDocumentosEnTiempoReal<Turno>('turnos', '', '',
      (turnos: Turno[]) => {
        this.listadoTurnosConAcciones = turnos.map((turno) =>
          this.cargarAccionesPermitidasAlTurno(turno)
        );
        this.turnosFiltrados = [...this.listadoTurnosConAcciones];
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    this.desuscripcion();
  }

  private cargarAccionesPermitidasAlTurno(turno: Turno): TurnoConAcciones {
    const accionesPermitidas = this.obtenerEstadoTurno(turno);
    return {
      ...turno,
      accionesPermitidas: accionesPermitidas
    };
  }

  public obtenerEstadoTurno(turno: Turno): string[] {
    const acciones = [];
    if (turno) {
      switch (turno.estado) {
        case "realizado":
            acciones.push("realizado");
          break;
        case "solicitado":
        case "aceptado":
          acciones.push("cancelar-turno");
          break;
        case "cancelado":
          acciones.push("cancelado");
          break;
        case "rechazado":
          acciones.push("rechazado");
          break;
      }
    }
    return acciones;
  }

  public mapearATurno(turnoConAcciones: TurnoConAcciones): Turno {
    const { accionesPermitidas, ...turnoOriginal } = turnoConAcciones;
    return turnoOriginal as Turno;
  }

  // Funciones
  public async cancelarTurno() {
    try {
      // Aplico los cambios necesarios en el turno
      const estadoAnterior = this.turnoSeleccionado.estado;
      this.turnoSeleccionado.estado = "cancelado";
      this.turnoSeleccionado.motivoEstado = this.motivoCancelacion;
      // Hago la modificación en base de datos
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._logService.crearLogTurno(this.turnoSeleccionado, estadoAnterior);
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue cancelado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer cancelar el turno");
    }
  }

  public cambiarOrden() {
    this.ordenAscendente = !this.ordenAscendente;
  }
}