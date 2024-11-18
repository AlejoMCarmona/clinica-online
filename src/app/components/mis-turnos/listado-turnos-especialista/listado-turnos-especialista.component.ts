import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { Turno } from '../../../models/turno.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TurnoConAcciones } from '../interfaces/turno-con-acciones.interface';
import { FiltroTurnosEspecialistaComponent } from '../filtro-turnos-especialista/filtro-turnos-especialista.component';
import { FinalizarTurnoComponent } from '../finalizar-turno/finalizar-turno.component';
import { Unsubscribe } from '@angular/fire/auth';

@Component({
  selector: 'listado-turnos-especialista',
  standalone: true,
  imports: [ CommonModule, FormsModule, FiltroTurnosEspecialistaComponent,FinalizarTurnoComponent ],
  templateUrl: './listado-turnos-especialista.component.html',
  styleUrl: './listado-turnos-especialista.component.css'
})

export class ListadoTurnosEspecialistaComponent implements OnInit, OnDestroy {
  @Input() usuario!: Usuario;
  public turnoSeleccionado!: Turno;
  public motivoEstado!: string;
  public listadoTurnosConAcciones: TurnoConAcciones[] = [];
  public turnosFiltrados: TurnoConAcciones[] = [];
  public modalFinalizarTurno: boolean = false;
  public desuscripcion!: Unsubscribe

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    this.desuscripcion = this._firestoreService.obtenerDocumentosEnTiempoReal<Turno>('turnos', 'idEspecialista', this.usuario.id!,
      (turnos: Turno[]) => {  // Callback que maneja los turnos actualizados
        // Actualizamos los turnos con las acciones permitidas
        this.listadoTurnosConAcciones = turnos.map((turno) =>
          this.cargarAccionesPermitidasAlTurno(turno)
        );
        this.turnosFiltrados = [...this.listadoTurnosConAcciones];
        this.cdr.detectChanges();  // Forzamos la actualización de la vista
      }
    );
  }

  ngOnDestroy(): void {
    this.desuscripcion();
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
      await this._firestoreService.modificarDocumento("turnos", id!, turnoCancelado);
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
