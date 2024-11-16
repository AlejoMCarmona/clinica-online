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
  templateUrl: './registro-page.component.html',
  styleUrl: './registro-page.component.css'
})

export class RegistroPageComponent implements OnInit {
  @Input() permitirRegistroAdmin: boolean = false;
  @Input() habilitarRedireccionamiento: boolean = true;
  @Input() rutaRedireccionamiento: string = "/home";
  public altaRolElegido: string = "";

  constructor(private _router: Router) {}

  ngOnInit(): void {}

  public cambiarTipoUsuario(tipoUsuario: string): void {
    this.altaRolElegido = tipoUsuario.toLowerCase();
  }

  public redirigir(): void {
    if(this.habilitarRedireccionamiento && this.rutaRedireccionamiento && this.rutaRedireccionamiento != "") {
      this._router.navigate([`${this.rutaRedireccionamiento}`]);
    }
  }
}