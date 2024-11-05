import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RegistroPacienteComponent } from '../../components/registro/registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from '../../components/registro/registro-especialista/registro-especialista.component';
import { RegistroAdminComponent } from '../../components/registro/registro-admin/registro-admin.component';
import { Router } from '@angular/router';

@Component({
  selector: 'registro',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RegistroPacienteComponent, RegistroEspecialistaComponent, RegistroAdminComponent ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})

export class RegistroComponent implements OnInit {
  @Input() permitirRegistroAdmin: boolean = false;
  @Input() habilitarRedireccionamiento: boolean = true;
  @Input() rutaRedireccionamiento: string = "/home";
  public altaRolElegido: string = 'paciente';

  constructor(private _router: Router) {}

  ngOnInit(): void {
    this.altaRolElegido = 'paciente';
  }

  public cambiarTipoUsuario(event: any): void {
    this.altaRolElegido = event.target.value.toLowerCase();
  }

  public redirigir(): void {
    if(this.habilitarRedireccionamiento && this.rutaRedireccionamiento && this.rutaRedireccionamiento != "") {
      this._router.navigate([`${this.rutaRedireccionamiento}`]);
    }
  }
}