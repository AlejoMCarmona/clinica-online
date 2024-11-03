import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'listado-pacientes',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './listado-pacientes.component.html',
  styleUrl: './listado-pacientes.component.css'
})

export class ListadoPacientesComponent {
  public listaPacientes: any[] = [];

  constructor(private _firestoreService: FirestoreService, private _storageService: StorageService) {}

  ngOnInit(): void {
    this._firestoreService.obtenerDocumentosPorCampo("usuarios", "rol", "paciente")
    .then(listaPacientes => {
      this.listaPacientes = listaPacientes;
      this.listaPacientes.forEach(p => {
        this._storageService.obtenerUrlImagen("fotos-perfil/pacientes", p.id + "-primaria")
        .then(url => p.imagen = url)
        .catch(() => console.log("ERROR intentando obtener las imagenes de los pacientes"));
      });
    })
    .catch(() => console.log("ERROR intentando obtener los pacientes"));
  }
}
