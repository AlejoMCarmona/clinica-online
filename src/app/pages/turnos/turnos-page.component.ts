import { Component } from '@angular/core';
import { ListadoTurnosAdminComponent } from '../../components/turnos/listado-turnos-admin/listado-turnos-admin.component';

@Component({
  selector: 'app-turnos',
  standalone: true,
  imports: [ ListadoTurnosAdminComponent ],
  templateUrl: './turnos-page.component.html',
  styleUrl: './turnos-page.component.css'
})
export class TurnosPageComponent {

}
