import { ChangeDetectorRef, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { EncuestaPaciente, Turno } from '../../../models/turno.interface';
import { Usuario } from '../../../models/usuarios.interface';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FiltroTurnosPacienteComponent } from '../filtro-turnos-paciente/filtro-turnos-paciente.component';
import { TurnoConAcciones } from '../interfaces/turno-con-acciones.interface';
import { Unsubscribe } from '@angular/fire/auth';
import { HistoriaClinica, HistoriaPaciente } from '../../../models/historia-paciente.interface';
import { LogService } from '../../../services/log.service';

@Component({
  selector: 'listado-turnos-paciente',
  standalone: true,
  imports: [CommonModule, FormsModule, FiltroTurnosPacienteComponent],
  templateUrl: './listado-turnos-paciente.component.html',
  styleUrl: './listado-turnos-paciente.component.css'
})

export class ListadoTurnosPacienteComponent implements OnInit, OnDestroy {
  @Input() usuario!: Usuario;
  public listadoTurnosConAcciones: TurnoConAcciones[] = [];
  public turnosFiltrados: TurnoConAcciones[] = [];
  public turnoSeleccionado!: Turno;
  public motivoCancelacion: string = "";
  public encuestaPaciente!: EncuestaPaciente;
  public calificacionAtencion: number | null = null;
  private desuscripcion!: Unsubscribe;
  public historialesPacientes: HistoriaPaciente[] = [];

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService, private cdr: ChangeDetectorRef, private _logService: LogService) {}

  async ngOnInit(): Promise<void> {
    this.encuestaPaciente = { recomendarHospital: false, recomendarEspecialista: false, conformidad: false, recomendacion: "" };
    this.historialesPacientes = await this._firestoreService.obtenerDocumentos("historias-pacientes");
    this.desuscripcion = this._firestoreService.obtenerDocumentosEnTiempoReal<Turno>('turnos', 'idPaciente', this.usuario.id!,
      (turnos: Turno[]) => {
        this.listadoTurnosConAcciones = turnos.map((turno) =>
          this.cargarAccionesPermitidasAlTurno(turno)
        );
        this.listadoTurnosConAcciones = this.asociarHistoriasClinicas(this.listadoTurnosConAcciones, this.historialesPacientes);
        this.turnosFiltrados = [...this.listadoTurnosConAcciones ];
        this.cdr.detectChanges();
      }
    );
  }

  ngOnDestroy(): void {
    this.desuscripcion();
  }

  private cargarAccionesPermitidasAlTurno(turno: Turno): TurnoConAcciones {
    const accionesPermitidas = this.obtenerAccionesPermitidas(turno);
    return {
      ...turno,
      accionesPermitidas: accionesPermitidas
    };
  }

  private asociarHistoriasClinicas(turnos: TurnoConAcciones[], historiales: HistoriaPaciente[]): TurnoConAcciones[] {
    const historiasPorTurno: Record<string, HistoriaClinica> = {};
  
    historiales.forEach(historial => {
      historial.historiaClinica.forEach(historia => {
        historiasPorTurno[historia.idTurno] = historia;
      });
    });
  
    // Enriquecer cada turno con su historia clínica correspondiente
    const turnosConHistorias = turnos.map(turno => {
      if (turno.id && historiasPorTurno[turno.id]) {
        return {
          ...turno,
          historiaClinica: historiasPorTurno[turno.id],
        };
      }
      return turno; // Si no tiene historia clínica, el turno queda igual
    });
  
    return turnosConHistorias;
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
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso("Encuesta completada", "La encuesta fue guardada correctamente");
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un problema al guardar la encuesta");
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
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso("Calificación guardada", "La calificación de atención fue guardada correctamente");
    } catch (error) {
      this._mensajesService.lanzarMensajeError("Error", "Hubo un problema al guardar la calificación");
    }
  }
}