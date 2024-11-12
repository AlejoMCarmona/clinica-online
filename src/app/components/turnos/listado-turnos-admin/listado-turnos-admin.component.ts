import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { Usuario } from '../../../models/usuarios.interface';
import { TurnoConAcciones } from '../../mis-turnos/interfaces/turno-con-acciones.interface';
import { Turno } from '../../../models/turno.interface';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { FormsModule } from '@angular/forms';
import { FiltroTurnosPacienteComponent } from '../../mis-turnos/filtro-turnos-paciente/filtro-turnos-paciente.component';

@Component({
  selector: 'listado-turnos-admin',
  standalone: true,
  imports: [ CommonModule, FiltroTurnosPacienteComponent, FormsModule ],
  templateUrl: './listado-turnos-admin.component.html',
  styleUrl: './listado-turnos-admin.component.css'
})

export class ListadoTurnosAdminComponent {
  public listadoTurnosConAcciones: TurnoConAcciones[] = [];
  public turnosFiltrados: TurnoConAcciones[] = [];
  public turnoSeleccionado!: Turno;
  public motivoCancelacion: string = "";

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const turnos: Turno[] = await this._firestoreService.obtenerDocumentos("turnos");
    turnos.forEach(turno => {
      this.listadoTurnosConAcciones.push(this.cargarAccionesPermitidasAlTurno(turno));
    });
    this.turnosFiltrados = [...this.listadoTurnosConAcciones];
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

  // FUNCIONES:
  public actualizarTurnoEnListado(turno: Turno): void {
    const accionesPermitidas = this.obtenerEstadoTurno(turno); // Actualizamos las acciones permitidas según el nuevo estado

    // Recorremos listadoEstadosTurnos y actualizamos solo el turno que coincide con el id
    this.listadoTurnosConAcciones.forEach(t => {
      if (t.id === turno.id) {
        t.estado = turno.estado || t.estado;
        t.motivoEstado = turno.motivoEstado || t.motivoEstado;
        t.accionesPermitidas = accionesPermitidas;
      }
    });
    
    this.cdr.detectChanges(); // Forzamos la actualización de la vista
  }

  public mapearATurno(turnoConAcciones: TurnoConAcciones): Turno {
    const { accionesPermitidas, ...turnoOriginal } = turnoConAcciones;
    return turnoOriginal as Turno;
  }

  // Funciones
  public async cancelarTurno() {
    try {
      // Aplico los cambios necesarios en el turno
      this.turnoSeleccionado.estado = "cancelado";
      this.turnoSeleccionado.motivoEstado = this.motivoCancelacion;
      // Hago la modificación en base de datos
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      // Actualizo su estado en el listado de turnos
      this.actualizarTurnoEnListado(this.turnoSeleccionado);
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue cancelado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer cancelar el turno");
    }
  }
}