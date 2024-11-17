import { Component } from '@angular/core';
import { Usuario } from '../../../models/usuarios.interface';
import { TablaInteractivaBase } from '../../../shared/interfaces/tabla-interactiva-base';
import { FirestoreService } from '../../../services/firestore.service';
import { CommonModule } from '@angular/common';
import { StorageService } from '../../../services/storage.service';
import { HighlightSelectionDirective } from '../../../directives/highlight-selection.directive';

@Component({
  selector: 'lista-especialistas',
  standalone: true,
  imports: [ CommonModule, HighlightSelectionDirective ],
  outputs: [ 'filaSeleccionada' ],
  templateUrl: './lista-especialistas.component.html',
  styleUrl: './lista-especialistas.component.css'
})

export class ListaEspecialistasComponent extends TablaInteractivaBase<Usuario> {
  public especialistaSeleccionado!: Usuario;

  constructor(private _firestoreService: FirestoreService, private _storageService: StorageService) {
    super();
  }

  // Método para obtener todos los especialistas
  public obtenerInformacion(): void {
    this._firestoreService.obtenerDocumentosPorCampo("usuarios", "rol", "especialista")
      .then(especialistas => {
        this.listaElementos = especialistas; // Cargamos todos los especialistas sin filtrar
        this.listaElementos.forEach(e => {
          this._storageService.obtenerUrlImagen("fotos-perfil/especialistas", e.id!)
            .then(url => e.imagenUrl = url)
            .catch(() => console.log("ERROR intentando obtener las imágenes de los especialistas"));
        });
      })
      .catch(error => {
        console.error("Error al obtener especialistas:", error);
        this.listaElementos = []; // Evitamos listas indefinidas en caso de error
      });
  }

  // Método para seleccionar un especialista
  public seleccionarEspecialista(especialista: Usuario): void {
    this.especialistaSeleccionado = especialista;
    super.seleccionarFila(this.especialistaSeleccionado);
  }
}
