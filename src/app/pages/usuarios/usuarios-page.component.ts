import { Component } from '@angular/core';
import { ListadoEspecialistasComponent } from '../../components/usuarios/listado-especialistas/listado-especialistas.component';
import { ListadoPacientesComponent } from '../../components/usuarios/listado-pacientes/listado-pacientes.component';
import { ListadoAdminsComponent } from '../../components/usuarios/listado-admins/listado-admins.component';
import { CommonModule } from '@angular/common';
import { RegistroPageComponent } from '../registro/registro-page.component';
import { FirestoreService } from '../../services/firestore.service';
import { HistoriaPaciente } from '../../models/historia-paciente.interface';
import { TablaHistoriaClinicaComponent } from '../../components/historia-clinica/tabla-historia-clinica/tabla-historia-clinica.component';
import { MensajesService } from '../../services/mensajes.service';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ CommonModule, ListadoEspecialistasComponent, ListadoPacientesComponent, ListadoAdminsComponent, RegistroPageComponent, TablaHistoriaClinicaComponent ],
  templateUrl: './usuarios-page.component.html',
  styleUrl: './usuarios-page.component.css'
})

export class UsuariosPageComponent {
  public altaRolElegido!: string;
  public historiaClinicaSeleccionada!: HistoriaPaciente | null;
  public modalHistoriaClinicaVisible = false;

  constructor(private _firestoreService: FirestoreService, private _mensajesService: MensajesService) {}

  ngOnInit(): void {
    this.altaRolElegido = "paciente";
  }

  public cambiarTipoUsuario(event: any): void {
    this.altaRolElegido = event.target.value.toLowerCase();
  }

  public async mostrarHistoriaClinica(idUsuario: string) {
    this._firestoreService.obtenerDocumentosPorCampo("historias-pacientes", "idPaciente", idUsuario)
    .then(historialPacienteArray => {
      if (historialPacienteArray.length == 0) {
        this._mensajesService.lanzarNotificacionErrorCentro("Este aún no paciente no tiene una historia clínica");
        return;
      }
      this.historiaClinicaSeleccionada = historialPacienteArray[0];
      this.modalHistoriaClinicaVisible = true;
    });
  }

  public cerrarModalHistoriaClinica(): void {
    this.modalHistoriaClinicaVisible = false;
  }
}
