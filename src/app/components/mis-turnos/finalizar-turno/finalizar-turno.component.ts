import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Turno } from '../../../models/turno.interface';
import { FirestoreService } from '../../../services/firestore.service';
import { MensajesService } from '../../../services/mensajes.service';
import { HistoriaClinica, HistoriaPaciente } from '../../../models/historia-paciente.interface';

@Component({
  selector: 'finalizar-turno',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule, FormsModule ],
  templateUrl: './finalizar-turno.component.html',
  styleUrl: './finalizar-turno.component.css'
})

export class FinalizarTurnoComponent {
  public formularioHistoriaClinica: FormGroup;
  public pasoActual!: number;
  public diagnostico!: string;
  public comentario!: string;
  public modalVisible!: boolean;
  @Input() turnoSeleccionado!: Turno; // Turno donde se debe cargar la información.
  @Input() abrir!: boolean; // Al estar en "true" el modal se muestra.
  @Output() cerrar: EventEmitter<void> = new EventEmitter<void>(); // Emite un evento cuando el formulario fue enviado.
  @Output() turnoEnviado: EventEmitter<Turno> = new EventEmitter<Turno>(); // Emite un evento cuando el formulario fue enviado.

  constructor(private fb: FormBuilder, private _firestoreService: FirestoreService, private _mensajesService: MensajesService) {
    this.formularioHistoriaClinica = this.fb.group({
      altura: ['', Validators.required],
      peso: ['', Validators.required],
      temperatura: ['', Validators.required],
      presion: ['', Validators.required],
      datosDinamicos: this.fb.array([]),
    });

    this.modalVisible = false;
    this.pasoActual = 1;
    this.diagnostico = '';
    this.comentario = '';
  }

  get altura() {
    return this.formularioHistoriaClinica.get('altura');
  }

  get peso() {
    return this.formularioHistoriaClinica.get('peso');
  }

  get temperatura() {
    return this.formularioHistoriaClinica.get('temperatura');
  }

  get presion() {
    return this.formularioHistoriaClinica.get('presion');
  }

  get datosDinamicos(): FormArray {
    return this.formularioHistoriaClinica.get('datosDinamicos') as FormArray;
  }

  public cerrarModal(): void {
    this.cerrar.emit();  // Emite evento de cierre al componente padre
  }

  public retroceder() {
    this.pasoActual = 1;
    this.formularioHistoriaClinica.reset();
  }

  public avanzar(): void {
    this.pasoActual = 2;
  }

  public verificarPaso1() {
    if (this.comentario.length == 0 || this.diagnostico.length == 0) {
      return false;
    }
    return true;
  }

  public agregarDatoDinamico(): void {
    const datoDinamico = this.fb.group({
      clave: ['', Validators.required],
      valor: ['', Validators.required],
    });
    this.datosDinamicos.push(datoDinamico);
  }

  public eliminarDatoDinamico(index: number): void {
    this.datosDinamicos.removeAt(index);
  }

  public async cargarHistoriaPaciente(turno: Turno, historiaClinica: HistoriaClinica) {
    const historiaPacienteArray: HistoriaPaciente[] = await this._firestoreService.obtenerDocumentosPorCampo("historias-pacientes", "idPaciente", turno.idPaciente);
    if (historiaPacienteArray.length == 0) {
      // Si el paciente aún no tiene una historia, la creo.
      const historiaPaciente: HistoriaPaciente = {
        idPaciente: turno.idPaciente,
        nombrePaciente: turno.nombrePaciente,
        historiaClinica: [ historiaClinica ] 
      }
      await this._firestoreService.subirDocumento(historiaPaciente, "historias-pacientes");
    } else {
      // Si el paciente tiene una historia creada, la actualizo.
      const historiaPaciente = historiaPacienteArray[0];
      historiaPaciente.historiaClinica.push(historiaClinica);
      const { id, ...historiaActualizada } = historiaPaciente;
      await this._firestoreService.modificarDocumento("historias-pacientes", id!, historiaActualizada);
    }
  }

  public async finalizarTurnoYHistoria(): Promise<void> {
    try {
      // Aplico los cambios necesarios en el turno
      this.turnoSeleccionado.estado = "realizado";
      if (!this.turnoSeleccionado.comentariosEspecialista) this.turnoSeleccionado.comentariosEspecialista = {}; 
      this.turnoSeleccionado.comentariosEspecialista.comentario = this.comentario;
      this.turnoSeleccionado.comentariosEspecialista.diagnostico = this.diagnostico;
      // Preparo los objetos para la modificación en base de datos
      const { id, ...turnoFinalizado } = this.turnoSeleccionado;
      const historiaClinica: HistoriaClinica = this.formularioHistoriaClinica.value;
      historiaClinica.idTurno = this.turnoSeleccionado.id!;
      historiaClinica.fechaTurno = this.obtenerFechaActual();
      // Hago las modificaciones en base de datos
      await this._firestoreService.modificarDocumento("turnos", this.turnoSeleccionado.id || "", turnoFinalizado);
      await this.cargarHistoriaPaciente(this.turnoSeleccionado, historiaClinica);
      // Actualizo su estado en el listado de turno
      this.turnoEnviado.emit(this.turnoSeleccionado);
      this.cerrarModal();
      // Envío un mensaje de éxito
      this._mensajesService.lanzarMensajeExitoso(":)", "El turno fue realizado");
    } catch (error) {
      console.log(error);
      this._mensajesService.lanzarMensajeError(":(", "Hubo un error al querer rechazar el turno");
    }
  }

  private obtenerFechaActual(): string {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = (fecha.getMonth() + 1).toString().padStart(2, '0'); // Mes de 2 dígitos
    const dia = fecha.getDate().toString().padStart(2, '0'); // Día de 2 dígitos
    return `${anio}-${mes}-${dia}`;
  }
}
