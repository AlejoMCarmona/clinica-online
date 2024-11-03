import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistroPacienteComponent } from '../../components/registro/registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from '../../components/registro/registro-especialista/registro-especialista.component';
import { RegistroAdminComponent } from '../../components/registro/registro-admin/registro-admin.component';

@Component({
  selector: 'registro',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RegistroPacienteComponent, RegistroEspecialistaComponent, RegistroAdminComponent ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})

export class RegistroComponent implements OnInit {
  @Input() permitirRegistroAdmin: boolean = false;
  public altaRolElegido: string = 'paciente';

  ngOnInit(): void {
    this.altaRolElegido = 'paciente';
  }

  public cambiarTipoUsuario(event: any): void {
    this.altaRolElegido = event.target.value.toLowerCase();
  }
}