import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Usuario } from '../../models/usuarios.interface';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../services/storage.service';
import { PerfilConfiguracionEspecialistaComponent } from '../../components/perfil-configuracion-especialista/perfil-configuracion-especialista.component';
import { TablaHistoriaClinicaComponent } from '../../components/historia-clinica/tabla-historia-clinica/tabla-historia-clinica.component';
import { HistoriaPaciente } from '../../models/historia-paciente.interface';
import { FirestoreService } from '../../services/firestore.service';
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { Paciente } from '../../models/paciente.interface';
import { Turno } from '../../models/turno.interface';
import { FormsModule } from '@angular/forms';
import { MensajesService } from '../../services/mensajes.service';
import { WhereFilterOp } from '@angular/fire/firestore';

@Component({
  selector: 'app-mi-perfil',
  standalone: true,
  imports: [ CommonModule, PerfilConfiguracionEspecialistaComponent, TablaHistoriaClinicaComponent, FormsModule ],
  templateUrl: './mi-perfil-page.component.html',
  styleUrl: './mi-perfil-page.component.css'
})

export class MiPerfilPageComponent implements OnInit {
  public usuario!: Usuario;
  public imagenUrl!: string;
  public historiaPaciente!: HistoriaPaciente;
  public especialidadSeleccionada: string = '';
  public especialidades: string[] = [];
  private turnos: Turno[] = [];

  constructor(private authService: AuthService, private storageService: StorageService, private _firestoreService: FirestoreService, private _mensajesService: MensajesService) {}

  /**
   * Obtiene el usuario autenticado, establece la URL de la imagen de perfil y configura el formulario de disponibilidad si el usuario es un especialista.
   */
  async ngOnInit(): Promise<void> {
    this.usuario = await this.authService.obtenerUsuario(); // Obtener datos del usuario autenticado
    const informacionFoto = this.obtenerAccesoFoto();
    this.imagenUrl = await this.storageService.obtenerUrlImagen(informacionFoto.nombreCarpeta, informacionFoto.nombreFoto);
    if (this.usuario.rol == "paciente") {
      this.obtenerHistoriaPaciente()
      this.extraerEspecialidades();
    }
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
    this.historiaPaciente = historiaPacienteArray[0];
  }

  public generarPdfHistoriaClinica() {
    if (!this.historiaPaciente) return;
  
    const doc = new jsPDF();

    // Logo e información básica
    const fechaEmision = new Date().toLocaleDateString();
    const img = new Image();
    img.src = "/logo_clinica.png"
    doc.addImage(img, 'PNG', 10, 10, 30, 30);
    doc.setFontSize(16);
    doc.text('Informe de Historia Clínica', 50, 20);
    doc.setFontSize(10);
    doc.text(`Fecha de emisión: ${fechaEmision}`, 50, 30);

    // Información del paciente
    const informacion: Paciente = this.usuario.informacion as Paciente;
    doc.setFontSize(12);
    doc.text(`Paciente: ${informacion.nombre} ${informacion.apellido}`, 10, 50);
    doc.text(`Edad: ${informacion.edad} años`, 10, 60);
    doc.text(`DNI: ${informacion.dni}`, 10, 70);
    doc.text(`Obra social: ${informacion.obraSocial || 'No especificada'}`, 10, 80);
  
    // Tabla con la historia clínica
    const rows = this.historiaPaciente.historiaClinica.map((historia) => [
      historia.fechaTurno,
      historia.altura + ' cm',
      historia.peso + ' kg',
      historia.temperatura + ' °C',
      historia.presionArterial,
      JSON.stringify(historia.datosDinamicos || {}).replace(/[{}"]/g, ''),
    ]);
  
    autoTable(doc, {
      head: [['Fecha', 'Altura', 'Peso', 'Temperatura', 'Presión Arterial', 'Datos Dinámicos']],
      body: rows,
      startY: 100,
    });
  
    // Descargar el PDF
    doc.save(`Historia_Clinica_${this.historiaPaciente.nombrePaciente}.pdf`);
  }

    /**
   * Extrae todas las especialidades únicas de las atenciones en la historia clínica.
   */
    private async extraerEspecialidades() {
      const filtros = [
        {
          campo: "idPaciente",
          operador: "==" as WhereFilterOp,
          valor: this.usuario.id!,
        },
        {
          campo: "estado",
          operador: "==" as WhereFilterOp,
          valor: "realizado",
        }
      ];

      const turnos: Turno[] = await this._firestoreService.obtenerDocumentosConFiltros("turnos", filtros);
      const especialidadesSet = new Set(
        turnos.map(turno => turno.especialidad)
      );
      this.turnos = turnos;
      this.especialidades = Array.from(especialidadesSet);
    }
  
    /**
     * Genera un PDF con las atenciones realizadas en una especialidad específica.
     */
    public generarPdfPorEspecialidad() {
      if (!this.especialidadSeleccionada) {
        this._mensajesService.lanzarNotificacionErrorCentro('Debes elegir una especialidad para descargar.');
        return;
      }
  
      const atencionesFiltradas = this.turnos.filter(
        turno => turno.especialidad === this.especialidadSeleccionada
      );

      if (atencionesFiltradas.length === 0) {
        this._mensajesService.lanzarNotificacionErrorCentro('No se encontraron atenciones para esta especialidad.');
        return;
      }
  
      const doc = new jsPDF();
      const fechaEmision = new Date().toLocaleDateString();
      const img = new Image();
      img.src = "/logo_clinica.png";
  
      // Logo e información básica
      doc.addImage(img, 'PNG', 10, 10, 30, 30);
      doc.setFontSize(16);
      doc.text('Informe de Atenciones por Especialidad', 50, 20);
      doc.setFontSize(10);
      doc.text(`Fecha de emisión: ${fechaEmision}`, 50, 30);
      doc.text(`Especialidad: ${this.especialidadSeleccionada}`, 10, 50);
  
      // Tabla de atenciones
      const rows = atencionesFiltradas.map(atencion => [
        atencion.fecha,
        atencion.nombreEspecialista,
        atencion.comentariosEspecialista?.diagnostico || 'Sin diagnóstico',
        atencion.comentariosEspecialista?.comentario || 'Sin comentario'
      ]);
  
      autoTable(doc, {
        head: [['Fecha', 'Especialista', 'Diagnóstico', 'Comentario']],
        body: rows,
        startY: 70,
      });
  
      // Descargar el archivo
      doc.save(`Atenciones_${this.usuario.informacion.nombre}_${this.usuario.informacion.apellido}_${this.especialidadSeleccionada}.pdf`);
    }
}