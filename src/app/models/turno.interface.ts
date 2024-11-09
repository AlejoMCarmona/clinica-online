export interface Turno {
    idPaciente: string;
    idEspecialista: string;
    especialidad: string;
    fecha: string;
    hora: string;
    estado: 'solicitado' | 'aceptado' | 'rechazado' | 'cancelado' | 'realizado';
    comentarios?: {
      motivoCancelacion?: string;
      motivoRechazo?: string;            // Comentario del motivo de rechazo (si el turno fue rechazado)
      reseña?: string;                   // Reseña y diagnóstico del especialista luego de finalizar el turno
      calificacionAtencion?: {
        calificacion: number;            // Calificación numérica del paciente (e.g., de 1 a 5)
        comentario: string;              // Comentario de atención del paciente luego de su turno
      };
    };
}