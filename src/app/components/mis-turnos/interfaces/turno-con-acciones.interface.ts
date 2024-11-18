import { HistoriaClinica } from "../../../models/historia-paciente.interface";
import { EstadoTurno } from "../../../models/turno.interface";

export interface TurnoConAcciones {
    id?: string;
    idPaciente: string;
    nombrePaciente: string;
    idEspecialista: string;
    nombreEspecialista: string;
    especialidad: string;
    fecha: string;
    hora: string;
    estado: EstadoTurno;
    motivoEstado?: string;
    accionesPermitidas: string[];
    historiaClinica?: HistoriaClinica;
    comentariosEspecialista?: {
      comentario?: string;               // Comentario/Reseña del especialista luego de finalizar el turno
      diagnostico?: string;              // Diagnóstico del especialista luego de finalizar el turno
    };
    comentariosPaciente?: {
      calificacion?: number;              // Calificación numérica del paciente (e.g., de 1 a 5)
      comentarioPaciente?: string;        // Reseña de la atención del paciente luego de su turno
      encuesta?: EncuestaPaciente
    };
  }
  
  export interface EncuestaPaciente {
    recomendarEspecialista?: boolean;  // ¿Recomendarias al especialista?
    recomendarHospital?: boolean;      // ¿Recomendarias este hospital?
    conformidad?: boolean;             // ¿Conforme con la atencion?
    recomendacion?: string;            // ¿Quieres dejar una recomendacion?
  }