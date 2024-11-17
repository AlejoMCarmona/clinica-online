import { Component, Input } from '@angular/core';
import { TablaInteractivaBase } from '../../../shared/interfaces/tabla-interactiva-base';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { InformacionEspecialidades } from '../../../models/especialista.interface';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'lista-especialidades',
  standalone: true,
  imports: [ FormsModule, CommonModule ],
  outputs: [ 'filaSeleccionada' ],
  templateUrl: './lista-especialidades.component.html',
  styleUrl: './lista-especialidades.component.css'
})

export class ListaEspecialidadesComponent extends TablaInteractivaBase<InformacionEspecialidades> {
  public especialidadSeleccionada!: InformacionEspecialidades;
  @Input() listadoEspecialidades!: InformacionEspecialidades[];

  constructor(private _storageService: StorageService) {
    super();
  }

  public obtenerInformacion(): void {
    // Filtrar especialidades con información completa
    this.listaElementos = this.listadoEspecialidades.filter(especialidad => especialidad.informacionCompletada === true);

    // Obtener URLs de las imágenes
    this.listaElementos.forEach(especialidad => {
      this._storageService.obtenerUrlImagen("fotos-especialidades", especialidad.nombre + ".png")
      .then(url => especialidad.imagenUrl = url)
      .catch(() => {
        // Si falla, asignar la imagen por defecto
        this._storageService.obtenerUrlImagen("fotos-especialidades", "por-defecto.png")
        .then(defaultUrl => especialidad.imagenUrl = defaultUrl)
        .catch(() => console.log("Error obteniendo la imagen por defecto"));
      });
    });
  }

  public seleccionarEspecialidad(especialidad: InformacionEspecialidades): void {
    this.especialidadSeleccionada = especialidad;
    super.seleccionarFila(especialidad);
  }
}