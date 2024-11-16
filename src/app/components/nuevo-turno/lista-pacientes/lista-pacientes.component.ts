import { Component } from '@angular/core';
import { Usuario } from '../../../models/usuarios.interface';
import { TablaInteractivaBase } from '../../../shared/interfaces/tabla-interactiva-base';
import { FirestoreService } from '../../../services/firestore.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lista-pacientes',
  standalone: true,
  outputs: [ 'filaSeleccionada' ],
  imports: [ CommonModule ],
  templateUrl: './lista-pacientes.component.html',
  styleUrl: './lista-pacientes.component.css'
})

export class ListaPacientesComponent extends TablaInteractivaBase<Usuario> {
  public pacienteSeleccionado!: Usuario;
  public pacientesCargados: boolean = false;

  constructor(private _firestoreService: FirestoreService) {
    super();
  }

  public obtenerInformacion(): void {
    this.pacientesCargados = false;
    this._firestoreService.obtenerDocumentosPorCampo("usuarios", "rol", "paciente")
      .then(pacientes => {
        this.listaElementos = pacientes;
        this.pacientesCargados = true;
      })
      .catch(error => {
        console.error("Error al obtener pacientes:", error);
        this.pacientesCargados = true; // Para evitar la pantalla de carga infinita
      });
  }

  public seleccionarPaciente(paciente: Usuario): void {
    this.pacienteSeleccionado = paciente;
    super.seleccionarFila(this.pacienteSeleccionado);
  }
}
