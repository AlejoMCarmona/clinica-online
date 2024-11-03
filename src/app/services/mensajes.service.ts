import { Injectable } from '@angular/core';
import Swal, { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})

export class MensajesService {

  constructor() { }

  public lanzarMensajeInformativo(titulo: string, mensaje: string, img = "") {
    this.lanzarMensaje(titulo, mensaje, AlertIcon.Information, img);
  }

  public lanzarMensajeExitoso(titulo: string, mensaje: string, img = "") {
    this.lanzarMensaje(titulo, mensaje, AlertIcon.Success, img);
  }

  public lanzarMensajeError(titulo: string, mensaje: string, img = "") {
    this.lanzarMensaje(titulo, mensaje, AlertIcon.Error, img);
  }

  private lanzarMensaje(titulo: string, mensaje: string, icon: AlertIcon, img: string = "") {
    const options: SweetAlertOptions = {
      icon: icon,
      title: titulo,
      text: mensaje
    };

    if(img != "") options.imageUrl = img;

    Swal.fire(options);
  }

  public lanzarNotificacionExitoCentro(titulo: string, tiempo: number = 3000, img: string = "") {
    this.lanzarNotificacion(titulo, AlertPosition.Center, AlertIcon.Success, tiempo, img);
  }

  public lanzarNotificacionExito(titulo: string, tiempo: number = 3000, img: string = "") {
    this.lanzarNotificacion(titulo, AlertPosition.TopEnd, AlertIcon.Success, tiempo, img);
  }

  public lanzarNotificacionErrorCentro(titulo: string, tiempo: number = 3000, img: string = "") {
    this.lanzarNotificacion(titulo, AlertPosition.Center, AlertIcon.Error, tiempo, img);
  }

  public lanzarNotificacionError(titulo: string, tiempo: number = 3000, img: string = "") {
    this.lanzarNotificacion(titulo, AlertPosition.TopEnd, AlertIcon.Error, tiempo, img);
  }

  private lanzarNotificacion(titulo: string, posicion: AlertPosition, icono: AlertIcon, tiempo: number = 3000,  img: string = "") {
    const options: SweetAlertOptions = {
      toast: true,
      position: posicion,
      icon: icono,
      title: titulo,
      showConfirmButton: false,
      timer: tiempo,
      width: 800,
      padding: "2rem",
    };

    if(img != "") options.imageUrl = img;

    Swal.fire(options);
  }

  public lanzarNotificacionErrorCentroConFuncionalidad(titulo: string, mensaje: string, tiempo: number = 3000, callback?: () => void) {
    this.lanzarNotificacionConFuncionalidad(titulo, mensaje, AlertPosition.Center, AlertIcon.Error, tiempo, callback);
  }

  private lanzarNotificacionConFuncionalidad(titulo: string, mensaje: string, posicion: AlertPosition, icono: AlertIcon, tiempo: number, callback?: () => void): void {
    Swal.fire({
      icon: icono,
      title: titulo,
      text: mensaje,
      timer: tiempo, // Duración de la notificación en milisegundos
      timerProgressBar: true,
      showConfirmButton: false,
      position: posicion,
      willClose: () => {
        // Ejecutar la función de callback si está definida
        if (callback) {
          callback();
        }
      }
    });
  }

  public lanzarPreguntaCentro(titulo: string, subtitulo: string, textoConfirmar: string, textoCancelar: string) {
    return this.lanzarConOpciones(titulo, subtitulo, AlertPosition.Center, AlertIcon.Question, textoConfirmar, textoCancelar);
  }

  private lanzarConOpciones(titulo: string, subtitulo: string, posicion: AlertPosition, icono: AlertIcon, textoConfirmar: string, textoCancelar: string) : Promise<SweetAlertResult> {
    const opciones: SweetAlertOptions = {
      title: titulo,
      text: subtitulo,
      icon: icono,
      position: posicion,
      showCancelButton: true,
      confirmButtonText: "No",
      cancelButtonText: "Sí",
    };
    
    if (textoCancelar != "") opciones.cancelButtonText = textoCancelar; 
    if (textoCancelar != "") opciones.confirmButtonText = textoConfirmar; 

    return Swal.fire(opciones);
  }
}

enum AlertIcon {
  Success = "success",
  Error = "error",
  Warning = "warning",
  Information = "info",
  Question = "question"
}

enum AlertPosition {
  Top = "top",
  TopStart = "top-start",
  TopEnd = "top-end",
  Center = "center",
  CenterStart = "center-start",
  CenterEnd = "center-end",
  Bottom = "bottom",
  BottomStart = "bottom-start",
  BottomEnd = "bottom-end"
}