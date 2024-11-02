import { Injectable } from '@angular/core';
import { getDownloadURL, ref, Storage, uploadBytes } from '@angular/fire/storage';

@Injectable({
  providedIn: 'root'
})

export class StorageService {

  constructor(private _storage: Storage) { }

  public subirImagen(imagen: any, nombreCarpeta: string, nombreImagen: string) {
    const imgRef = ref(this._storage, `${nombreCarpeta}/${nombreImagen}`);
    return uploadBytes(imgRef, imagen);
  }

  public obtenerUrlImagen(nombreCarpeta: string, nombreImagen: string) {
    const imagenRef = ref(this._storage, `${nombreCarpeta}/${nombreImagen}`);
    return getDownloadURL(imagenRef);
  }
}
