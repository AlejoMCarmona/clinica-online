import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { EncuestaPaciente, Turno } from '../../../models/turno.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroTurnosComponent } from '../filtro-turnos/filtro-turnos.component';

@Component({
  selector: 'listado-turnos-paciente',
  standalone: true,
  imports: [ CommonModule, FormsModule, FiltroTurnosComponent ],
  templateUrl: './listado-turnos-paciente.component.html',
  styleUrl: './listado-turnos-paciente.component.css'
})

export class ListadoTurnosPacienteComponent implements OnInit {
  @Input() usuario!: Usuario;
  public listadoEstadosTurnos: any[] = [];
  public listadoEstadosTurnosInicial: any[] = [];
  public turnoSeleccionado!: Turno;
  public motivoCancelacion: string = "";
  public encuestaPaciente: EncuestaPaciente = { recomendarHospital: false, recomendarEspecialista: false, conformidad: false, recomendacion: "" };
  public calificacionAtencion: number | null = null;

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef) {}

  async ngOnInit(): Promise<void> {
    const turnos = await this._firestoreService.obtenerDocumentosPorCampo("turnos", "idPaciente", this.usuario.id!);
    turnos.forEach(turno => {
      this.listadoEstadosTurnos.push(this.cargarEstadosTurnos(turno));
    });
    this.listadoEstadosTurnosInicial = [...this.listadoEstadosTurnos];
  }

  public obtenerFiltro(turnosFiltrados: any): void {
    console.log(turnosFiltrados);
    this.listadoEstadosTurnos = turnosFiltrados;
  }

  private cargarEstadosTurnos(turno: Turno) {
    const accionesPermitidas = this.analizarEstado(turno);
    return {
      ...turno,
      accionesPermitidas: accionesPermitidas
    };
  }

  public actualizarTurno(turno: any): void {
    // Actualizamos las acciones permitidas según el nuevo estado
    turno.accionesPermitidas = this.analizarEstado(turno);
    // Actualizamos el listado con el nuevo estado y acciones
    this.listadoEstadosTurnos = this.listadoEstadosTurnos.map(t =>
      t.id === turno.id ? turno : t
    );
    // Forzamos la actualización de la vista
    this.cdr.detectChanges();
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

  public analizarEstado(turno: Turno): string[] {
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
      }
    }
    return acciones;
  }

  public async cancelarTurno() {
    try {
      this.turnoSeleccionado.estado = "cancelado";
      this.turnoSeleccionado.motivoEstado = this.motivoCancelacion;
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      this.actualizarEstadoTurno(this.turnoSeleccionado, "cancelado", this.motivoCancelacion);
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue cancelado");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer cancelar el turno");
    }
  }

  public completarEncuesta(turno: Turno) {
    this.turnoSeleccionado = turno;
  }

  // Verifica que las preguntas obligatorias estén respondidas
  public encuestaValida(): boolean {
    return (
      this.encuestaPaciente.recomendarEspecialista !== null &&
      this.encuestaPaciente.recomendarHospital !== null &&
      this.encuestaPaciente.conformidad !== null
    );
  }

  public async guardarEncuesta() {
    // Aquí procesas los datos de la encuesta, guardándolos en la base de datos
    try {
      this.turnoSeleccionado.comentariosPaciente = {
        ...this.turnoSeleccionado.comentariosPaciente,
        encuesta: this.encuestaPaciente
      };
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      this.actualizarTurno(this.turnoSeleccionado);
      this._mensajesService.lanzarMensajeExitoso("Encuesta completada", "La encuesta fue guardada correctamente");
    } catch (error) {
      this._mensajesService.lanzarMensajeError("Error", "Hubo un problema al guardar la encuesta");
    }
  }

  public async guardarCalificacion() {
    try {
      this.turnoSeleccionado.comentariosPaciente = {
        ...this.turnoSeleccionado.comentariosPaciente,
        calificacion: this.calificacionAtencion!
      };
      const { id, ...turnoModificado } = this.turnoSeleccionado;
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoModificado);
      this.actualizarTurno(this.turnoSeleccionado);
      this._mensajesService.lanzarMensajeExitoso("Calificación guardada", "La calificación de atención fue guardada correctamente");
    } catch (error) {
      this._mensajesService.lanzarMensajeError("Error", "Hubo un problema al guardar la calificación");
    }
  }
}