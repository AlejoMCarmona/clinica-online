import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { EncuestaPaciente, Turno } from '../../../models/turno.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroTurnosPacienteComponent } from '../filtro-turnos-paciente/filtro-turnos-paciente.component';
import { TurnoConAcciones } from '../interfaces/turno-con-acciones.interface';

@Component({
  selector: 'listado-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroTurnosPacienteComponent],
  templateUrl: './listado-turnos-paciente.component.html',
  styleUrl: './listado-turnos-paciente.component.css'
})

export class ListadoTurnosPacienteComponent implements OnInit {
  @Input() usuario!: Usuario;
  public listadoTurnosConAcciones: TurnoConAcciones[] = [];
  public turnosFiltrados: TurnoConAcciones[] = [];
  public turnoSeleccionado!: Turno;
  public motivoCancelacion: string = "";
  public encuestaPaciente!: EncuestaPaciente;
  public calificacionAtencion: number | null = null;

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const turnos: Turno[] = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idPaciente", this.usuario.id!);
    turnos.forEach(turno => {
      this.listadoTurnosConAcciones.push(this.cargarAccionesPermitidasAlTurno(turno));
    });
    this.turnosFiltrados = [...this.listadoTurnosConAcciones];
    this.encuestaPaciente = { recomendarHospital: false, recomendarEspecialista: false, conformidad: false, recomendacion: "" };
  }

  private cargarAccionesPermitidasAlTurno(turno: Turno): TurnoConAcciones {
    const accionesPermitidas = this.obtenerAccionesPermitidas(turno);
    return {
      ...turno,
      accionesPermitidas: accionesPermitidas
    };
  }

  public actualizarTurnoEnListado(turno: Turno): void {
    const accionesPermitidas = this.obtenerAccionesPermitidas(turno); // Actualizamos las acciones permitidas según el nuevo estado

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

  public guardarEncuestaTurnoEnListado(turno: Turno): void {
    const accionesPermitidas = this.obtenerAccionesPermitidas(turno); // Actualizamos las acciones permitidas según el nuevo estado

    // Recorremos listadoEstadosTurnos y actualizamos solo el turno que coincide con el id
    this.listadoTurnosConAcciones.forEach(t => {
      if (t.id === turno.id) {
        t.comentariosPaciente = {
          ...turno.comentariosPaciente,
          encuesta: turno.comentariosPaciente?.encuesta
        }
        t.accionesPermitidas = accionesPermitidas;
      }
    });
    
    this.cdr.detectChanges(); // Forzamos la actualización de la vista
  }

  public guardarCalificacionTurnoEnListado(turno: Turno): void {
    const accionesPermitidas = this.obtenerAccionesPermitidas(turno); // Actualizamos las acciones permitidas según el nuevo estado

    // Recorremos listadoEstadosTurnos y actualizamos solo el turno que coincide con el id
    this.listadoTurnosConAcciones.forEach(t => {
      if (t.id === turno.id) {
        t.comentariosPaciente = {
          ...turno.comentariosPaciente,
          calificacion: turno.comentariosPaciente?.calificacion
        }
        t.accionesPermitidas = accionesPermitidas;
      }
    });
    
    this.cdr.detectChanges(); // Forzamos la actualización de la vista
  }

  public mapearATurno(turnoConAcciones: TurnoConAcciones): Turno {
    const { accionesPermitidas, ...turnoOriginal } = turnoConAcciones;
    return turnoOriginal as Turno;
  }

  public obtenerAccionesPermitidas(turno: Turno): string[] {
    const acciones = [];
    if (turno) {
      switch (turno.estado) {
        case "realizado":
          if (turno.comentariosEspecialista) {
            acciones.push("ver-resena");
          }
          if (!turno.comentariosPaciente?.encuesta) {
            acciones.push("completar-encuesta");
          }
          if (!turno.comentariosPaciente?.calificacion) {
            acciones.push("calificar-atencion");
          }
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

  public async guardarEncuesta() {
    try {
      // Aplico los cambios necesarios en el turno
      this.turnoSeleccionado.comentariosPaciente = {
        ...this.turnoSeleccionado.comentariosPaciente,
        encuesta: this.encuestaPaciente
      };
      // Hago la modificación en base de datos
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      // Actualizo su estado en el listado de turnos
      this.guardarEncuestaTurnoEnListado(this.turnoSeleccionado);
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso("Encuesta completada", "La encuesta fue guardada correctamente");
    } catch (error) {
      this._mensajesService.lanzarMensajeError("Error", "Hubo un problema al guardar la encuesta");
    }
  }

  // Verifica que las preguntas obligatorias estén respondidas
  public encuestaValida(): boolean {
    return (
      this.encuestaPaciente.recomendarEspecialista !== null &&
      this.encuestaPaciente.recomendarHospital !== null &&
      this.encuestaPaciente.conformidad !== null
    );
  }

  public async guardarCalificacion() {
    try {
      // Aplico los cambios necesarios en el turno
      this.turnoSeleccionado.comentariosPaciente = {
        ...this.turnoSeleccionado.comentariosPaciente,
        calificacion: this.calificacionAtencion!
      };
      // Hago la modificación en base de datos
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      // Actualizo su estado en el listado de turnos
      this.guardarCalificacionTurnoEnListado(this.turnoSeleccionado);
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso("Calificación guardada", "La calificación de atención fue guardada correctamente");
    } catch (error) {
      this._mensajesService.lanzarMensajeError("Error", "Hubo un problema al guardar la calificación");
    }
  }
}