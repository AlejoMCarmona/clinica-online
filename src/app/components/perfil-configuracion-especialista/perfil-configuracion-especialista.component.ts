import { Component, Input, OnInit } from '@angular/core';
import { FirestoreService } from '../../services/firestore.service';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Usuario } from '../../models/usuarios.interface';
import { Especialista, HorariosDisponibilidad, InformacionEspecialidades } from '../../models/especialista.interface';
import { CommonModule } from '@angular/common';
import { MensajesService } from '../../services/mensajes.service';

@Component({
  selector: 'perfil-configuracion-especialista',
  standalone: true,
  imports: [ ReactiveFormsModule, CommonModule ],
  templateUrl: './perfil-configuracion-especialista.component.html',
  styleUrl: './perfil-configuracion-especialista.component.css'
})

export class PerfilConfiguracionEspecialistaComponent implements OnInit {
  public disponibilidadForm!: FormGroup;
  @Input() usuario!: Usuario;
  public minutosDisponibles: number[] = [0, 15, 30, 45];

  constructor(private firestoreService: FirestoreService, private fb: FormBuilder, private mensajesService: MensajesService) {}

  ngOnInit(): void {
    if (this.usuario.rol === "especialista") {
      this.crearFormularioDisponibilidad();
    }
  }
  
  /**
   * Crea el formulario de disponibilidad de horarios para cada especialidad asignada al especialista, generando controles de formulario dinámicos.
   */
  private crearFormularioDisponibilidad(): void {
    const especialista = this.usuario.informacion as Especialista;
    this.disponibilidadForm = this.fb.group({
      especialidades: this.fb.array(especialista.especialidades.map(especialidad => this.crearGrupoEspecialidad(especialidad)))
    });
  }

  /**
   * Crea un grupo de formulario para cada especialidad, incluyendo su nombre, duración del turno y sus horarios de disponibilidad.
   * @param especialidad - La especialidad para la cual se crea el grupo de formulario.
   * @returns Un FormGroup que representa la especialidad y sus horarios.
   */
  private crearGrupoEspecialidad(especialidad: InformacionEspecialidades): FormGroup {
    return this.fb.group({
      nombre: especialidad.nombre,
      duracionTurno: [especialidad.duracionTurno],
      horariosDisponibilidad: this.fb.array(
        especialidad.horariosDisponibilidad?.map(horario => this.crearGrupoHorario(horario)) || []
      )
    });
  }

  /**
   * Crea un grupo de formulario para cada horario de disponibilidad, descomponiendo la hora de inicio y fin en horas y minutos para facilitar su manipulación.
   * @param horario - El horario a ser agregado en el grupo de formulario.
   * @returns Un FormGroup que representa un horario de disponibilidad.
   */
  private crearGrupoHorario(horario: HorariosDisponibilidad): FormGroup {
    const [desdeHora, desdeMinutos] = horario.desde.split(':').map(Number);
    const [hastaHora, hastaMinutos] = horario.hasta.split(':').map(Number);
    return this.fb.group({
      dia: [horario.dia],
      desdeHora: [desdeHora],
      desdeMinutos: [desdeMinutos],
      hastaHora: [hastaHora],
      hastaMinutos: [hastaMinutos]
    });
  }

  /**
   * GETTER:
   * Obtiene el `FormArray` de especialidades dentro del formulario de disponibilidad.
   * @returns Un FormArray que contiene todas las especialidades del especialista.
   */
  get especialidades(): FormArray {
    return this.disponibilidadForm.get('especialidades') as FormArray;
  }

  /**
   * Obtiene el `FormArray` de horarios de disponibilidad para una especialidad específica.
   * @param i - Índice de la especialidad en el array de especialidades.
   * @returns Un FormArray que contiene los horarios de disponibilidad de la especialidad.
   */
  public getHorariosDisponibilidad(i: number): FormArray {
    return this.especialidades.at(i).get('horariosDisponibilidad') as FormArray;
  }

  /**
   * Agrega un horario de disponibilidad nuevo en el formulario para una especialidad específica, con un horario predefinido de 08:00 a 17:00.
   * @param i - Índice de la especialidad en el array de especialidades.
   */
  public agregarHorario(i: number): void {
    this.getHorariosDisponibilidad(i).push(
      this.crearGrupoHorario({ dia: 0, desde: '08:00', hasta: '19:00' })
    );
  }

  /**
   * Guarda los datos de disponibilidad del especialista en Firestore, formateando los horarios
   * en el formato correcto y actualizando el documento correspondiente.
   */
  public async guardarDisponibilidad(): Promise<void> {
    const disponibilidadValida = this.verificarCompatibilidadHoraria();
    if (disponibilidadValida) {
      const especialista = this.usuario.informacion as Especialista;
      let especialidadesCargadas: InformacionEspecialidades[] = this.disponibilidadForm.value.especialidades;
      especialista.especialidades = especialidadesCargadas.map((esp: any) => ({
        nombre: esp.nombre,
        duracionTurno: esp.duracionTurno,
        informacionCompletada: esp.horariosDisponibilidad.length > 0 ? true : false,
        horariosDisponibilidad: esp.horariosDisponibilidad.map((horario: any) => ({
          dia: parseInt(horario.dia),
          desde: `${horario.desdeHora}:${horario.desdeMinutos.toString().padStart(2, '0')}`,
          hasta: `${horario.hastaHora}:${horario.hastaMinutos.toString().padStart(2, '0')}`
        }))
      }));

      try {
        await this.firestoreService.modificarDocumento('usuarios', this.usuario.id!, { informacion: especialista });
        this.mensajesService.lanzarNotificacionExitoCentro('Disponibilidad actualizada correctamente');
      } catch (error) {
        console.error("Error al guardar la disponibilidad: ", error);
        this.mensajesService.lanzarNotificacionErrorCentro('Hubo un error al actualizar la disponibilidad. Intente de nuevo.');
      }
    } else {
      this.mensajesService.lanzarMensajeError(
        "ERROR en la configuración",
        "El horario de atención configurado es inválido. " + 
        "Verifique que los días y los horarios seleccionados no se superpongan entre sí.");
    } 
  }

  /**
   * Obtiene las horas disponibles para el selector de tiempo dependiendo del día seleccionado.
   * Si es sábado, el rango es de 08 a 14; de lunes a viernes, de 08 a 19.
   * @param dia - El día de la semana (0 = domingo, 6 = sábado).
   * @returns Un array de números que representa las horas disponibles.
   */
  public getHorasDisponibles(dia: number): number[] {
    return dia === 6 ? this.range(8, 14) : this.range(8, 19); // Sábados de 08 a 14, lunes a viernes de 08 a 19
  }

  /**
   * Genera un array de números en un rango especificado.
   * @param start - Número de inicio del rango.
   * @param end - Número de fin del rango.
   * @returns Un array de números en el rango [start, end].
   */
  private range(start: number, end: number): number[] {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }

  /**
  * Verifica si existen superposiciones de horarios en el mismo día entre diferentes especialidades.
  * La función recorre todos los horarios de disponibilidad del especialista y determina si existe
  * alguna superposición que genere una incompatibilidad horaria.
  * 
  * @returns {boolean} - `false` si se detecta una incompatibilidad de horarios, `true` si no hay superposiciones.
  */
  private verificarCompatibilidadHoraria(): boolean {
    const especialidades = this.disponibilidadForm.value.especialidades;

    // Obtenemos un array con todos los horarios, incluyendo el día y especialidad
    const horarios = especialidades.flatMap((especialidad: any) => 
      especialidad.horariosDisponibilidad.map((horario: any) => ({
        dia: parseInt(horario.dia),
        desde: parseInt(horario.desdeHora) * 60 + parseInt(horario.desdeMinutos), // Convertir "desde" a minutos totales
        hasta: parseInt(horario.hastaHora) * 60 + parseInt(horario.hastaMinutos), // Convertir "hasta" a minutos totales
        especialidad: especialidad.nombre
      }))
    );

    // Iteramos por cada horario y verificamos si se superpone con otro horario el mismo día
    for (let i = 0; i < horarios.length; i++) {
      for (let j = i + 1; j < horarios.length; j++) {
        const horario1 = horarios[i];
        const horario2 = horarios[j];
  
        if (horario1.dia === horario2.dia) { //Si los horarios son del mismo día
          // Si se solapan
          if (
            (horario1.desde < horario2.hasta && horario1.hasta > horario2.desde) || // Solapamiento parcial o completo
            (horario1.desde === horario2.desde && horario1.hasta === horario2.hasta) // Solapamiento exacto
            ) {
            return false; // Incompatibilidad encontrada
          }
        }
      }
    }

    return true; // No se encontraron incompatibilidades de horarios
  }
  
}
