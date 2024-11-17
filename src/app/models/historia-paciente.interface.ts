export interface HistoriaPaciente {
    id?: string;
    idPaciente: string;
    nombrePaciente: string;
    historiaClinica: HistoriaClinica[] 
}

export interface HistoriaClinica {
    idTurno: string;
    fechaTurno: string;
    altura: number;
    peso: number;
    temperatura: number;
    presionArterial: number;
    datosDinamicos: any;
}