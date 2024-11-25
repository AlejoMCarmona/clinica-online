import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'ordenarPorFecha',
  standalone: true
})
export class OrdenarPorFechaPipe implements PipeTransform {

  transform(items: any[], ascendente: boolean = true): any[] {
    if (!items || items.length === 0) return items;

    return items.sort((a, b) => {
      const fechaA = new Date(`${a.fecha}T${a.hora}`);
      const fechaB = new Date(`${b.fecha}T${b.hora}`);
      return ascendente ? fechaA.getTime() - fechaB.getTime() : fechaB.getTime() - fechaA.getTime();
    });
  }

}
