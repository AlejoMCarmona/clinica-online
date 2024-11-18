import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { HistoriaPaciente } from '../../models/historia-paciente.interface';
import { Turno } from '../../models/turno.interface';
import { AuthService } from '../../services/auth.service';
import { Usuario } from '../../models/usuarios.interface';
import { MensajesService } from '../../services/mensajes.service';
import { CommonModule } from '@angular/common';
import { TablaHistoriaClinicaComponent } from '../../components/historia-clinica/tabla-historia-clinica/tabla-historia-clinica.component';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-pacientes',
  standalone: true,
  imports: [ CommonModule, TablaHistoriaClinicaComponent ],
  templateUrl: './pacientes-page.component.html',
  styleUrl: './pacientes-page.component.css'
})

export class PacientesPageComponent implements OnInit {
  public pacientesAtendidos: Usuario[] = [];
  public historiaSeleccionada!: HistoriaPaciente | null;
  public modalVisible: boolean = false;
  private idEspecialista!: string;

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
        turnosRealizados.forEach(turno => {
          if (!idPacientes.includes(turno.idPaciente)) {
            idPacientes.push(turno.idPaciente);
          }
        });
        this.pacientesAtendidos = await this.obtenerUsuarios(idPacientes);
      }
    }
    catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error a la hora de traer los pacientes atendidos");
    }
  }

  private async obtenerUsuarios(idPacientes: string[]) {
    const usuarios: Usuario[] = [];
    if (idPacientes.length > 0) {
      for (const id of idPacientes) {
        const usuarioObtenido = await this.firestoreService.obtenerDocumentosPorID("usuarios", id) as Usuario;
        if (usuarioObtenido) {
          usuarioObtenido.imagenUrl = await this._storageService.obtenerUrlImagen("fotos-perfil/pacientes", usuarioObtenido.id + "-primaria");
          usuarios.push(usuarioObtenido);
        }    
      }
    }
    return usuarios;
  }

  // Mostrar historia clínica
  public async verHistoriaClinica(idPaciente: string): Promise<void> {
    try {
      const historiaArray: HistoriaPaciente[] = await this.firestoreService.obtenerDocumentosPorCampo("historias-pacientes", "idPaciente", idPaciente);
      if (historiaArray.length > 0) {
        this.historiaSeleccionada = historiaArray[0];
        this.modalVisible = true;
      }

    } catch (error) {
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error a la hora de cargar la historia clínica");
    }
  }

  // Cerrar el modal
  public cerrarModal(): void {
    this.modalVisible = false;
    this.historiaSeleccionada = null;
  }
}
