import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { StorageService } from '../../../services/storage.service';
import { Usuario } from '../../../models/usuarios.interface';
import { BotonDescargarTurnosComponent } from '../boton-descargar-turnos/boton-descargar-turnos.component';

@Component({
  selector: 'listado-pacientes',
  standalone: true,
  imports: [ CommonModule, BotonDescargarTurnosComponent ],
  templateUrl: './listado-pacientes.component.html',
  styleUrl: './listado-pacientes.component.css'
})

export class ListadoPacientesComponent {
  public listaPacientes: any[] = [];
  @Output() idPacienteSeleccionado = new EventEmitter<string>();

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
