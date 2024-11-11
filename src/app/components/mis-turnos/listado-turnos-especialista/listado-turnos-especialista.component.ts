import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { AuthService } from '../../../services/auth.service';
import { MensajesService } from '../../../services/mensajes.service';
import { Turno } from '../../../models/turno.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
  public motivoCancelacion!: string;
  public motivoRechazo!: string;
  public diagnostico!: string;
  public comentario!: string;
  public listadoEstadosTurnos: any[] = [];

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const listadoTurnos: Turno[] = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idEspecialista", this.usuario.id!);
    listadoTurnos.forEach(t => {
     this.listadoEstadosTurnos.push(this.cargarEstadosTurnos(t));
    })
  }

  private cargarEstadosTurnos(turno: Turno) {
    const accionesPermitidas = this.analizarEstado(turno);
    return {
      ...turno,
      accionesPermitidas: accionesPermitidas
    }
  }

  public analizarEstado(turno: Turno): string[] {
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

  public actualizarEstadoTurno(turno: any, nuevoEstado: string, motivo?: string): void {
    turno.estado = nuevoEstado;
    if (motivo) {
      turno.motivoEstado = motivo;
    }

    // Actualizamos las acciones permitidas según el nuevo estado
    turno.accionesPermitidas = this.analizarEstado(turno);

    // Actualizamos el listado con el nuevo estado y acciones
    this.listadoEstadosTurnos = this.listadoEstadosTurnos.map(t =>
      t.id === turno.id ? { ...t, estado: nuevoEstado, motivoEstado: motivo || t.motivoEstado, accionesPermitidas: turno.accionesPermitidas } : t
    );

    // Forzamos la actualización de la vista
    this.cdr.detectChanges();
  }

  public mapearATurno(turnoConAcciones: any): Turno {
    const { accionesPermitidas, ...turnoOriginal } = turnoConAcciones;
    return turnoOriginal as Turno;
  }

  public async cancelarTurno() {
    try {
      this.turnoSeleccionado.estado = "cancelado";
      this.turnoSeleccionado.motivoEstado = this.motivoCancelacion;
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      this.actualizarEstadoTurno(this.turnoSeleccionado, 'cancelado', this.motivoCancelacion);
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue cancelado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer cancelar el turno");
    }
  }

  public async aceptarTurno(turno: Turno) {
    try {
      turno.estado = "aceptado";
      const { id, ...turnoModificado } = turno;
      await this._firestoreService.modificarDocumento("turnos", turno.id || "", turnoModificado);
      this.actualizarEstadoTurno(turno, 'aceptado');
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue aceptado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer aceptar el turno");
    }
  }

  public async finalizarTurno() {
    try {
      this.turnoSeleccionado.estado = "realizado";
      if (!this.turnoSeleccionado.comentariosEspecialista) this.turnoSeleccionado.comentariosEspecialista = {}; 
      this.turnoSeleccionado.comentariosEspecialista.comentario = this.comentario;
      this.turnoSeleccionado.comentariosEspecialista.diagnostico = this.diagnostico;
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      this.actualizarEstadoTurno(this.turnoSeleccionado, 'realizado');
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue realizado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer rechazar el turno");
    }  
  }

  public async rechazarTurno() {
    try {
      this.turnoSeleccionado.estado = "rechazado";
      this.turnoSeleccionado.motivoEstado = this.motivoRechazo;
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      this.actualizarEstadoTurno(this.turnoSeleccionado, 'rechazado', this.motivoRechazo);
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue rechazado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer rechazar el turno");
    }
  }
}
