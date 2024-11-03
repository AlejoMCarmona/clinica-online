import { Admin } from "./admin.interface";
import { Especialista } from "./especialista.interface";
import { Paciente } from "./paciente.interface";

export interface Usuario {
    email: string;
    rol: string;
    autorizado: boolean;
    informacion: Paciente | Especialista | Admin;
}