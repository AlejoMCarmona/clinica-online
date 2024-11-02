import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class ApiService {

  constructor(private _http: HttpClient) {}

  /**
   * Realiza una llamada GET de manera asincrónica a la URL especificada.
   * @param url La URL a la que se realizará la solicitud GET.
   * @returns Un Observable con la respuesta de la API.
   */
  public async obtenerInformacion<T>(url: string): Promise<T> {
    try {
      const response = await firstValueFrom(this._http.get<T>(url));
      return response;
    } catch (error) {
      console.error('Error al hacer la solicitud GET:', error);
      throw error;
    }
  }
}