import { Component } from '@angular/core';
import { ListadoEspecialistasComponent } from '../../components/usuarios/listado-especialistas/listado-especialistas.component';
import { ListadoPacientesComponent } from '../../components/usuarios/listado-pacientes/listado-pacientes.component';
import { ListadoAdminsComponent } from '../../components/usuarios/listado-admins/listado-admins.component';
import { CommonModule } from '@angular/common';
import { RegistroPageComponent } from '../registro/registro-page.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ CommonModule, ListadoEspecialistasComponent, ListadoPacientesComponent, ListadoAdminsComponent, RegistroPageComponent ],
  templateUrl: './usuarios-page.component.html',
  styleUrl: './usuarios-page.component.css'
})

export class UsuariosPageComponent {
  public altaRolElegido!: string;

  ngOnInit(): void {
    this.altaRolElegido = "paciente";
  }

  public cambiarTipoUsuario(event: any): void {
    this.altaRolElegido = event.target.value.toLowerCase();
  }
}
