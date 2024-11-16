import { Component, EventEmitter, Input, Output, ɵSSR_CONTENT_INTEGRITY_MARKER } from '@angular/core';
import { Usuario } from '../../../models/usuarios.interface';
import { TablaInteractivaBase } from '../../../shared/interfaces/tabla-interactiva-base';
import { FirestoreService } from '../../../services/firestore.service';
import { Especialista } from '../../../models/especialista.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lista-especialistas',
  standalone: true,
  imports: [ CommonModule ],
  outputs: [ 'filaSeleccionada' ],
  templateUrl: './lista-especialistas.component.html',
  styleUrl: './lista-especialistas.component.css'
})
export class ListaEspecialistasComponent extends TablaInteractivaBase<Usuario> {
  public especialistaSeleccionado!: Usuario;
  private _especialidadSeleccionada!: string;
  @Input()
  set especialidadSeleccionada(value: string) {
    this._especialidadSeleccionada = value;
    this.obtenerInformacion();
  }
  get especialidadSeleccionada(): string {
    return this._especialidadSeleccionada;
  }

  constructor(private _firestoreService: FirestoreService) {
    super();
  }

  public obtenerInformacion() {
    this._firestoreService.obtenerDocumentosPorCampo("usuarios", "rol", "especialista")
    .then(especialistas => {
    let especialistasObtenidos: Usuario[] = [];
      especialistas.forEach(e => {
        let informacion = e.informacion as Especialista;
        informacion.especialidades.forEach(especialidad => {
          if (especialidad.nombre == this.especialidadSeleccionada && especialidad.informacionCompletada) {
            especialistasObtenidos.push(e);
          }
        });
      });
      this.listaElementos = especialistasObtenidos;
    });
  }

  public seleccionarEspecialista(especialista: Usuario): void {
    this.especialistaSeleccionado = especialista;
    super.seleccionarFila(this.especialistaSeleccionado);
  }
}
