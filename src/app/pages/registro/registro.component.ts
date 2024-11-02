import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RegistroPacienteComponent } from '../../components/registro/registro-paciente/registro-paciente.component';
import { RegistroEspecialistaComponent } from '../../components/registro/registro-especialista/registro-especialista.component';

@Component({
  selector: 'registro',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RegistroPacienteComponent, RegistroEspecialistaComponent ],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})

export class RegistroComponent implements OnInit {
  public esPaciente!: boolean;

  ngOnInit(): void {
    this.esPaciente = true;
  }

  public cambiarTipoUsuario(event: any): void {
    this.esPaciente = event.target.value.toLowerCase() == "paciente";
  }
}