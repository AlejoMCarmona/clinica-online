import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Usuario } from '../../../models/usuarios.interface';
import { FirestoreService } from '../../../services/firestore.service';
import { StorageService } from '../../../services/storage.service';
import { MensajesService } from '../../../services/mensajes.service';
import { Especialista } from '../../../models/especialista.interface';

@Component({
  selector: 'listado-especialistas',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './listado-especialistas.component.html',
  styleUrl: './listado-especialistas.component.css'
})

export class ListadoEspecialistasComponent implements OnInit {
  public listaEspecialistas: any[] = [];

  constructor(private _firestoreService: FirestoreService, private _storageService: StorageService, private _mensajesService: MensajesService) {}

  ngOnInit(): void {
    this._firestoreService.obtenerDocumentosPorCampo("usuarios", "rol", "especialista")
    .then(listaEspecialistas => {
      this.listaEspecialistas = listaEspecialistas;
      this.listaEspecialistas.forEach(e => {
        this._storageService.obtenerUrlImagen("fotos-perfil/especialistas", e.id)
          .then(url => e.imagen = url)
          .catch(() => console.log("ERROR intentando obtener las imágenes de los especialistas"));
      });
    })
    .catch(() => console.log("ERROR intentando obtener los especialistas"));
  }

  public cambiarAutorizacion(usuario: any) {
    const usuarioModificado: Usuario = {
      email: usuario.email,
      autorizado: !usuario.autorizado,
      rol: "especialista",
      informacion: usuario.informacion
    }
    this._firestoreService.modificarDocumento("usuarios", usuario.id, usuarioModificado)
    .then(() => {
      this._mensajesService.lanzarMensajeExitoso("Autorización modificada", `El especialista ${usuario.informacion.nombre} ${usuario.informacion.apellido} fue modificado.`);
      usuario.autorizado = usuarioModificado.autorizado;
    })
    .catch(() => this._mensajesService.lanzarMensajeError("ERROR", `Hubo un error durante la activación del usuario`));
  }

  public obtenerEspecialidades(UsuarioEspecialista: Usuario) {
    let especialidades: string = "";
    let especialista = UsuarioEspecialista.informacion as Especialista;
    especialista.especialidades.forEach(e => {
      especialidades += e.nombre + ", ";
    })
    return especialidades.slice(0, -2);
  }
}
