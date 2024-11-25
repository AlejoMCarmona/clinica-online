import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ocultarPalabra',
  standalone: true
})
export class OcultarPalabraPipe implements PipeTransform {

  transform(palabra: string | number, esCorreo: boolean = true): string {
    if (typeof palabra === 'number') {
      palabra = palabra.toString();
    }

    let palabraOcultada = "";
    if (esCorreo) {
      const [ primeraParte, segundaParte ] = palabra.split("@");
      palabraOcultada = primeraParte[0] + "*".repeat(primeraParte.length - 1) + segundaParte;
    } else {
      palabraOcultada = palabra[0] + "*".repeat(palabra.length - 1);
    }
    return palabraOcultada;
  }
}
