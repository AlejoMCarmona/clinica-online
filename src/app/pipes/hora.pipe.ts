import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hora',
  standalone: true
})

export class HoraPipe implements PipeTransform {
  transform(horaCompleta: string): string {
    const [hora, minutos] = horaCompleta.split(':');
    return `${hora}:${minutos}`;  // Formato "hh:mm"
  }
}
