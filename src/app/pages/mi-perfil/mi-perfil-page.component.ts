import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Usuario } from '../../models/usuarios.interface';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { PerfilConfiguracionEspecialistaComponent } from '../../components/perfil-configuracion-especialista/perfil-configuracion-especialista.component';
import { TablaHistoriaClinicaComponent } from '../../components/historia-clinica/tabla-historia-clinica/tabla-historia-clinica.component';
import { HistoriaPaciente } from '../../models/historia-paciente.interface';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [ CommonModule, PerfilConfiguracionEspecialistaComponent, TablaHistoriaClinicaComponent ],
  templateUrl: './mi-perfil-page.component.html',
  styleUrl: './mi-perfil-page.component.css'
})

export class MiPerfilPageComponent implements OnInit {
  public usuario!: Usuario;
  public imagenUrl!: string;
  public historiaPaciente!: HistoriaPaciente;

  constructor(private authService: AuthService, private storageService: StorageService, private _firestoreService: FirestoreService) {}

  /**
   * Obtiene el usuario autenticado, establece la URL de la imagen de perfil y configura el formulario de disponibilidad si el usuario es un especialista.
   */
  async ngOnInit(): Promise<void> {
    this.usuario = await this.authService.obtenerUsuario(); // Obtener datos del usuario autenticado
    const informacionFoto = this.obtenerAccesoFoto();
    this.imagenUrl = await this.storageService.obtenerUrlImagen(informacionFoto.nombreCarpeta, informacionFoto.nombreFoto);
    if (this.usuario.rol == "paciente") this.obtenerHistoriaPaciente();
  }

  /**
   * Determina la ubicación y el nombre del archivo de la imagen de perfil según el rol del usuario (especialista, paciente, o administrador).
   * @returns Un objeto con `nombreCarpeta` y `nombreFoto` para acceder a la imagen.
   */
  private obtenerAccesoFoto() {
    const informacionFoto = {
      nombreCarpeta: "fotos-perfil/",
      nombreFoto: ""
    };

    switch (this.usuario.rol) {
      case "especialista":
        informacionFoto.nombreCarpeta += "especialistas";
        informacionFoto.nombreFoto = this.usuario.id!;
        break;
      case "paciente":
        informacionFoto.nombreCarpeta += "pacientes";
        informacionFoto.nombreFoto = this.usuario.id! + "-primaria";
        break;
      default:
        informacionFoto.nombreCarpeta += "admins";
        informacionFoto.nombreFoto = this.usuario.id!;
        break;
    }

    return informacionFoto;
  }

  public async obtenerHistoriaPaciente() {
    const historiaPacienteArray: HistoriaPaciente[] = await this._firestoreService.obtenerDocumentosPorCampo("historias-pacientes", "idPaciente", this.usuario.id!);
    console.log(JSON.stringify(historiaPacienteArray));
    this.historiaPaciente = historiaPacienteArray[0];
  }
}