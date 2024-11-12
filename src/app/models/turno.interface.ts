export interface Turno {
  id?: string;
  idPaciente: string;
  idEspecialista: string;
  especialidad: string;
  fecha: string;
  hora: string;
  estado: EstadoTurno;
  motivoEstado?: string;
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

export type EstadoTurno = 'solicitado' | 'aceptado' | 'rechazado' | 'cancelado' | 'realizado';