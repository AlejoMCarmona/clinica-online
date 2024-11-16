import { Component } from '@angular/core';
import { Especialidad } from '../../../models/especialidades.interface';
import { TablaInteractivaBase } from '../../../shared/interfaces/tabla-interactiva-base';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../services/firestore.service';

@Component({
  selector: 'lista-especialidades',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  outputs: [ 'filaSeleccionada' ],
  templateUrl: './lista-especialidades.component.html',
  styleUrl: './lista-especialidades.component.css'
})

export class ListaEspecialidadesComponent extends TablaInteractivaBase<Especialidad> {
  public especialidadSeleccionada!: Especialidad;

  constructor(private _firestoreService: FirestoreService) {
    super();
  }

  public obtenerInformacion(): void {
    this._firestoreService.obtenerDocumentos("especialidades", "nombre", "asc")
    .then(especialidades => {
      this.listaElementos = especialidades;
    });
  }

  public seleccionarEspecialidad(especialidad: Especialidad): void {
    this.especialidadSeleccionada = especialidad;
    super.seleccionarFila(especialidad);
  }
}
