import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { AuthService } from '../../../services/auth.service';
import { MensajesService } from '../../../services/mensajes.service';
import { EstadoTurno, Turno } from '../../../models/turno.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnoConAcciones } from '../interfaces/turno-con-acciones.interface';

@Component({
  selector: 'listado-turnos-especialista',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './listado-turnos-especialista.component.html',
  styleUrl: './listado-turnos-especialista.component.css'
})

export class ListadoTurnosEspecialistaComponent {
  @Input() usuario!: Usuario;
  public turnoSeleccionado!: Turno;
  public motivoEstado!: string;
  public diagnostico!: string;
  public comentario!: string;
  public listadoTurnosConAcciones: TurnoConAcciones[] = [];

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const listadoTurnos: Turno[] = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idEspecialista", this.usuario.id!);
    listadoTurnos.forEach(t => {
     this.listadoTurnosConAcciones.push(this.cargarAccionesPermitidasAlTurno(t));
    })
  }

  private cargarAccionesPermitidasAlTurno(turno: Turno): TurnoConAcciones {
    const accionesPermitidas = this.obtenerAccionesPermitidas(turno);
    const turnoConAcciones: TurnoConAcciones = {
      ...turno,
      accionesPermitidas: accionesPermitidas
    }
    return turnoConAcciones;
  }

  public obtenerAccionesPermitidas(turno: Turno): string[] {
    const acciones = [];
  
    switch (turno.estado) {
      case 'solicitado':
        acciones.push('cancelar-turno', 'rechazar-turno', 'aceptar-turno');
        break;
      case 'aceptado':
        acciones.push('finalizar-turno');
        break;
      case 'realizado':
        if (turno.comentariosEspecialista?.comentario || turno.comentariosEspecialista?.diagnostico) {
          acciones.push('ver-resena');
        }
        break;
    }
  
    return acciones;
  }

  public actualizarTurnoEnListado(turno: Turno, nuevoEstado: EstadoTurno, motivo?: string): void {
    turno.estado = nuevoEstado;
    if (motivo) {
      turno.motivoEstado = motivo;
    }

    const accionesPermitidas = this.obtenerAccionesPermitidas(turno); // Actualizamos las acciones permitidas según el nuevo estado

    // Recorremos listadoEstadosTurnos y actualizamos solo el turno que coincide con el id
    this.listadoTurnosConAcciones.forEach(t => {
      if (t.id === turno.id) {
        t.estado = nuevoEstado;
        t.motivoEstado = motivo || t.motivoEstado;
        t.accionesPermitidas = accionesPermitidas;
      }
    });

    // Forzamos la actualización de la vista
    this.cdr.detectChanges();
  }

  public mapearATurno(turnoConAcciones: TurnoConAcciones): Turno {
    const { accionesPermitidas, ...turnoOriginal } = turnoConAcciones;
    return turnoOriginal as Turno;
  }

  // ACCIONES DE LOS TURNOS:
  public async cancelarTurno() {
    try {
      // Aplico los cambios necesarios en el turno
      this.turnoSeleccionado.estado = "cancelado";
      this.turnoSeleccionado.motivoEstado = this.motivoEstado;
      // Hago la modificación en base de datos
      const { id, ...turnoCancelado} = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoCancelado);
      // Actualizo su estado en el listado de turnos
      this.actualizarTurnoEnListado(this.turnoSeleccionado, 'cancelado', this.motivoEstado);
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue cancelado");
      this.motivoEstado = "";
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer cancelar el turno");
    }
  }

  public async aceptarTurno(turno: Turno) {
    try {
      // Aplico los cambios necesarios en el turno
      turno.estado = "aceptado";
      // Hago la modificación en base de datos
      const { id, ...turnoAceptado } = turno;
      await this._firestoreService.modificarDocumento("turnos", turno.id || "", turnoAceptado);
      // Actualizo su estado en el listado de turnos
      this.actualizarTurnoEnListado(turno, 'aceptado');
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue aceptado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer aceptar el turno");
    }
  }

  public async finalizarTurno() {
    try {
      // Aplico los cambios necesarios en el turno
      this.turnoSeleccionado.estado = "realizado";
      if (!this.turnoSeleccionado.comentariosEspecialista) this.turnoSeleccionado.comentariosEspecialista = {}; 
      this.turnoSeleccionado.comentariosEspecialista.comentario = this.comentario;
      this.turnoSeleccionado.comentariosEspecialista.diagnostico = this.diagnostico;
      // Hago la modificación en base de datos
      const { id, ...turnoFinalizado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoFinalizado);
      // Actualizo su estado en el listado de turnos
      this.actualizarTurnoEnListado(this.turnoSeleccionado, 'realizado');
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue realizado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer rechazar el turno");
    }  
  }

  public async rechazarTurno() {
    try {
      // Aplico los cambios necesarios en el turno
      this.turnoSeleccionado.estado = "rechazado";
      this.turnoSeleccionado.motivoEstado = this.motivoEstado;
      // Hago la modificación en base de datos
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      // Actualizo su estado en el listado de turnos
      this.actualizarTurnoEnListado(this.turnoSeleccionado, 'rechazado', this.motivoEstado);
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue rechazado");
      this.motivoEstado = "";
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer rechazar el turno");
    }
  }
}
