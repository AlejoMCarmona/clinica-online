import { Component, OnInit } from '@angular/core';
import { ListadoTurnosPacienteComponent } from '../../components/mis-turnos/listado-turnos-paciente/listado-turnos-paciente.component';
import { Usuario } from '../../models/usuarios.interface';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { ListadoTurnosEspecialistaComponent } from "../../components/mis-turnos/listado-turnos-especialista/listado-turnos-especialista.component";

@Component({
  selector: 'app-mis-turnos',
  standalone: true,
  imports: [CommonModule, ListadoTurnosPacienteComponent, ListadoTurnosEspecialistaComponent ],
  templateUrl: './mis-turnos-page.component.html',
  styleUrl: './mis-turnos-page.component.css'
})

export class MisTurnosPageComponent implements OnInit {
  public usuario!: Usuario;

  constructor(private _authService: AuthService) {}
  
  async ngOnInit(): Promise<void> {
    this.usuario = await this._authService.obtenerUsuario();
    console.log(JSON.stringify(this.usuario));
  }
}
