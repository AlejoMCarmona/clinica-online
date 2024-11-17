export interface Especialista {
  nombre: string;
  apellido: string;
  edad: number;
  dni: string;
  especialidades: InformacionEspecialidades[];
}

export interface InformacionEspecialidades {
  nombre: string;
  horariosDisponibilidad?: HorariosDisponibilidad[],
  duracionTurno: number;
  informacionCompletada: boolean;
  imagenUrl?: string;
}

export interface HorariosDisponibilidad {
  dia: number; // del 1 al 7
  hasta: string;
  desde: string;
}