import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { HistoriaClinica, HistoriaPaciente } from '../../models/historia-paciente.interface';
import { Turno } from '../../models/turno.interface';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuarios.interface';
import { MensajesService } from '../../services/mensajes.service';
import { CommonModule } from '@angular/common';
import { TablaHistoriaClinicaComponent } from '../../components/historia-clinica/tabla-historia-clinica/tabla-historia-clinica.component';
import { StorageService } from '../../services/storage.service';
import { UsuarioConTurno } from './interfaces/UsuarioConTurnos.interface';
import { WhereFilterOp } from '@angular/fire/firestore';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [ CommonModule, TablaHistoriaClinicaComponent ],
  templateUrl: './pacientes-page.component.html',
  styleUrl: './pacientes-page.component.css'
})

export class PacientesPageComponent implements OnInit {
  public pacientesAtendidos: UsuarioConTurno[] = [];
  public historiaSeleccionada!: HistoriaPaciente | null;
  public historiaClinicaDelTurnoSeleccionada!: HistoriaClinica | null;
  public modalHistoriaClinicaCompletaVisible: boolean = false;
  public modalHistoriaClinicaVisible: boolean = false;
  private idEspecialista!: string;

  // Mapa para almacenar las historias clínicas precargadas
  private historiasClinicasMap: Map<string, HistoriaPaciente> = new Map();

  constructor(private firestoreService: FirestoreService, private _authService: AuthService, private _mensajesService: MensajesService, private _storageService: StorageService) {}

  async ngOnInit() {
    this.idEspecialista = await this._authService.obtenerIdUsuario();
    await this.obtenerPacientesAtendidos();
  }

  private async obtenerPacientesAtendidos() {
    try {
      const turnos: Turno[] = await this.firestoreService.obtenerDocumentosPorCampo("turnos", "idEspecialista", this.idEspecialista);
      const turnosRealizados = turnos.filter(t => t.estado === "realizado");

      if (turnosRealizados.length > 0) {
        let idPacientes: string[] = [];
        turnosRealizados.forEach((turno) => {
          if (!idPacientes.includes(turno.idPaciente)) {
            idPacientes.push(turno.idPaciente);
          }
        });

        this.pacientesAtendidos = await this.obtenerUsuariosConTurnos(idPacientes);
        await this.cargarHistoriasClinicas(idPacientes);
      }
    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error a la hora de traer los pacientes atendidos");
    }
  }

  private async obtenerUsuariosConTurnos(idPacientes: string[]) {
    const usuarios: UsuarioConTurno[] = [];
    if (idPacientes.length > 0) {
      for (const id of idPacientes) {
        const usuarioObtenido: Usuario = (await this.firestoreService.obtenerDocumentosPorID("usuarios", id)) as Usuario;
        if (usuarioObtenido) {
          usuarioObtenido.imagenUrl = await this._storageService.obtenerUrlImagen("fotos-perfil/pacientes", usuarioObtenido.id + "-primaria");
          const ultimosTurnos: Turno[] = await this.obtenerUltimosTurnos(id, 3);
          const usuarioConTurno: UsuarioConTurno = {
            usuario: usuarioObtenido,
            Turno: ultimosTurnos,
          };
          usuarios.push(usuarioConTurno);
        }
      }
    }
    return usuarios;
  }

  private async obtenerUltimosTurnos(idPaciente: string, numeroTurnos: number) {
    const filtros = [
      { campo: "idPaciente", operador: "==" as WhereFilterOp, valor: idPaciente },
      { campo: "estado", operador: "==" as WhereFilterOp, valor: "realizado" },
    ];
    return await this.firestoreService.obtenerDocumentosConFiltros("turnos", filtros, numeroTurnos);
  }

  // Nueva función: cargar historias clínicas
  private async cargarHistoriasClinicas(idPacientes: string[]) {
    for (const id of idPacientes) {
      const historiaArray: HistoriaPaciente[] = await this.firestoreService.obtenerDocumentosPorCampo("historias-pacientes", "idPaciente", id);
      if (historiaArray.length > 0) {
        this.historiasClinicasMap.set(id, historiaArray[0]);
      }
    }
  }

  // Mostrar historia clínica de un turno
  public verHistoriaClinica(turno: Turno): void {
    const historiaPaciente = this.historiasClinicasMap.get(turno.idPaciente);
    if (historiaPaciente) {
      this.historiaClinicaDelTurnoSeleccionada = historiaPaciente.historiaClinica.find(hc => hc.idTurno === turno.id!)!;
      this.modalHistoriaClinicaVisible = true;
    } else {
      this._mensajesService.lanzarMensajeError(":(", "No se encontró la historia clínica para este paciente.");
    }
  }

  // Mostrar historia clínica completa
  public verHistoriaClinicaCompleta(idPaciente: string): void {
    const historiaPaciente = this.historiasClinicasMap.get(idPaciente);
    if (historiaPaciente) {
      this.historiaSeleccionada = historiaPaciente;
      this.modalHistoriaClinicaCompletaVisible = true;
    } else {
      this._mensajesService.lanzarMensajeError(":(", "No se encontró la historia clínica para este paciente.");
    }
  }

  // Cerrar los modales
  public cerrarModal(): void {
    this.modalHistoriaClinicaCompletaVisible = false;
    this.historiaSeleccionada = null;
  }

  public cerrarModalHistoriaClinicaTurno(): void {
    this.modalHistoriaClinicaVisible = false;
    this.historiaClinicaDelTurnoSeleccionada = null;
  }
}
