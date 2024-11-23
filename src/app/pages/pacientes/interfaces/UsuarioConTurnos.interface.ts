import { Turno } from "../../../models/turno.interface";
import { Usuario } from "../../../models/usuarios.interface";

export interface UsuarioConTurno {
    usuario: Usuario;
    Turno: Turno[];
}