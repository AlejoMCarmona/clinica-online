import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { Turno } from '../../../models/turno.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnoConAcciones } from '../interfaces/turno-con-acciones.interface';
import { FiltroTurnosEspecialistaComponent } from '../filtro-turnos-especialista/filtro-turnos-especialista.component';
import { FinalizarTurnoComponent } from '../finalizar-turno/finalizar-turno.component';

@Component({
  selector: 'listado-turnos-especialista',
  standalone: true,
  imports: [ CommonModule, FormsModule, FiltroTurnosEspecialistaComponent,FinalizarTurnoComponent ],
  templateUrl: './listado-turnos-especialista.component.html',
  styleUrl: './listado-turnos-especialista.component.css'
})

export class ListadoTurnosEspecialistaComponent {
  @Input() usuario!: Usuario;
  public turnoSeleccionado!: Turno;
  public motivoEstado!: string;
  public listadoTurnosConAcciones: TurnoConAcciones[] = [];
  public turnosFiltrados: TurnoConAcciones[] = [];
  public modalFinalizarTurno: boolean = false;

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const listadoTurnos: Turno[] = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idEspecialista", this.usuario.id!);
    listadoTurnos.forEach(t => {
     this.listadoTurnosConAcciones.push(this.cargarAccionesPermitidasAlTurno(t));
    });
    this.turnosFiltrados = [...this.listadoTurnosConAcciones];
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
      case 'cancelado':
        acciones.push('cancelado');
        break;
      case 'rechazado':
        acciones.push('rechazado');
        break;
    }
  
    return acciones;
  }

  public actualizarTurnoEnListado(turno: Turno): void {
    const accionesPermitidas = this.obtenerAccionesPermitidas(turno); // Actualizamos las acciones permitidas según el nuevo estado

    // Recorremos listadoEstadosTurnos y actualizamos solo el turno que coincide con el id
    this.listadoTurnosConAcciones.forEach(t => {
      if (t.id === turno.id) {
        t.estado = turno.estado;
        t.motivoEstado = turno.motivoEstado || t.motivoEstado;
        t.accionesPermitidas = accionesPermitidas;
      }
    });

    // Forzamos la actualización de la vista
    this.cdr.detectChanges();
  }

  public actualizarTurnoFinalizadoEnListado(turno: Turno): void {
    const accionesPermitidas = this.obtenerAccionesPermitidas(turno); // Actualizamos las acciones permitidas según el nuevo estado

    // Recorremos listadoEstadosTurnos y actualizamos solo el turno que coincide con el id
    this.listadoTurnosConAcciones.forEach(t => {
      if (t.id === turno.id) {
        t.estado = 'realizado';
        if (!t.comentariosEspecialista) t.comentariosEspecialista = {};
        t.comentariosEspecialista.comentario = turno.comentariosEspecialista?.comentario;
        t.comentariosEspecialista.diagnostico = turno.comentariosEspecialista?.diagnostico
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
      this.actualizarTurnoEnListado(this.turnoSeleccionado);
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
      this.actualizarTurnoEnListado(turno);
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue aceptado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer aceptar el turno");
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
      this.actualizarTurnoEnListado(this.turnoSeleccionado);
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue rechazado");
      this.motivoEstado = "";
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer rechazar el turno");
    }
  }

  // Acciones para controlar el modal de finalización
  public abrirModalFinalizar(turno: Turno) {
    this.turnoSeleccionado = turno;
    this.modalFinalizarTurno = true;
  }

  public cerrarModal() {
    this.modalFinalizarTurno = false;
  }
}
