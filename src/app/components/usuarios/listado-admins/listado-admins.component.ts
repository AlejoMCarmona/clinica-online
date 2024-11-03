import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { StorageService } from '../../../services/storage.service';

@Component({
  selector: 'listado-admins',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './listado-admins.component.html',
  styleUrl: './listado-admins.component.css'
})

export class ListadoAdminsComponent {
  public listaAdmins: any[] = [];

  constructor(private _firestoreService: FirestoreService, private _storageService: StorageService) {}

  ngOnInit(): void {
    this._firestoreService.obtenerDocumentosPorCampo("usuarios", "rol", "admin")
    .then(listaAdmins => {
      this.listaAdmins = listaAdmins;
    });
  }
}
