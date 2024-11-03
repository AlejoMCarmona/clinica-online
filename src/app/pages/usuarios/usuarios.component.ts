import { Component } from '@angular/core';
import { ListadoEspecialistasComponent } from '../../components/usuarios/listado-especialistas/listado-especialistas.component';
import { ListadoPacientesComponent } from '../../components/usuarios/listado-pacientes/listado-pacientes.component';
import { ListadoAdminsComponent } from '../../components/usuarios/listado-admins/listado-admins.component';
import { CommonModule } from '@angular/common';
import { RegistroComponent } from '../registro/registro.component';

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [ CommonModule, ListadoEspecialistasComponent, ListadoPacientesComponent, ListadoAdminsComponent, RegistroComponent ],
  templateUrl: './usuarios.component.html',
  styleUrl: './usuarios.component.css'
})

export class UsuariosComponent {
  public altaRolElegido!: string;

  ngOnInit(): void {
    this.altaRolElegido = "paciente";
  }

  public cambiarTipoUsuario(event: any): void {
    this.altaRolElegido = event.target.value.toLowerCase();
  }
}
