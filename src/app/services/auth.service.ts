import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signOut } from '@angular/fire/auth';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { FirestoreService } from './firestore.service';
import { Usuario } from '../models/usuarios.interface';
import { MensajesService } from './mensajes.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Servicio de autenticación que gestiona el estado del usuario, su autenticación
 * y obtiene información adicional como su rol desde Firestore.
 */
export class AuthService {
  private usuarioAutenticado: BehaviorSubject<string> = new BehaviorSubject<string>(""); // Almacena el email del usuario autenticado

  constructor(private auth: Auth, private _fire: FirestoreService) {}

  public async iniciarSesion(email: string, password: string): Promise<string | undefined> {
    const userCredential = await signInWithEmailAndPassword(this.auth, email, password);

    if (!userCredential.user.emailVerified) {
      await this.auth.signOut();
      throw Error("auth/email-no-verified");
    }

    const usuario = (await this._fire.obtenerDocumentosPorCampo("usuarios", "email", email))[0];
    if (usuario.rol == "especialista" && usuario.autorizado != true) {
      await this.auth.signOut();
      throw Error("auth/specialist-no-activated");
    }

    return undefined;
  }

  public async registrarUsuarioConVerificacion(email: string, password: string, usuarioInformacion: Usuario): Promise<string | undefined> {
    try {
      let usuarioOriginal;
      if (this.auth.currentUser) usuarioOriginal = this.auth.currentUser;

      const idUsuario = await this.subirUsuario(usuarioInformacion); // Creo el usuario con toda su información
      await createUserWithEmailAndPassword(this.auth, email, password); // Creo el usuario en Auth
      await sendEmailVerification(this.auth.currentUser!); // Envío el mail de verificación

      if (usuarioOriginal) {
        this.auth.updateCurrentUser(usuarioOriginal);
      } else {
        this.cerrarSesion();
      }

      return idUsuario;
    }
    catch (error: any) {
      let mensaje = "";
      switch (error.code) {
        case 'auth/email-already-in-use':
          mensaje = "Ya existe un usuario registrado con ese correo electrónico";
        break;
        default:
          mensaje = "Hubo un error ineperado a la hora de crear el usuario. Por favor, inténtelo más tarde";
        break;
      }
      alert("ERROR:" + mensaje);
      return undefined;
    }
  }

  private async subirUsuario(usuario: Usuario): Promise<string> {
    const resultado = await this._fire.subirDocumento(usuario, "usuarios");
    return resultado.id;
  }

  /**
   * Obtiene un observable que emite el email del usuario autenticado.
   * Escucha los cambios en el estado de autenticación y actualiza el BehaviorSubject.
   * 
   * @returns Observable que emite el email del usuario o una cadena vacía si no está autenticado.
   */
  public obtenerEmailUsuarioObservable(): Observable<string> {
    onAuthStateChanged(this.auth, user => {
      if (user && user.email) {
        this.usuarioAutenticado.next(user.email);
      } else {
        this.usuarioAutenticado.next("");
      }
    });
    return this.usuarioAutenticado.asObservable();
  }

  /**
   * Verifica si el usuario está autenticado.
   * 
   * @returns Promise que resuelve en `true` si el usuario está autenticado, de lo contrario `false`.
   */
  public estaAutenticado(): Promise<boolean> {
    return new Promise(resolve => {
      onAuthStateChanged(this.auth, user => {
        resolve(!!user);
      });
    });
  }

  /**
   * Obtiene el email del usuario autenticado en ese momento.
   * 
   * @returns Promise que resuelve el email del usuario si está autenticado, de lo contrario una cadena vacía.
   */
  public obtenerEmailUsuario(): Promise<string> {
    return new Promise(resolve => {
      onAuthStateChanged(this.auth, user => {
        if (user && user.email) {
          resolve(user.email);
        } else {
          resolve("");
        }
      });
    });
  }

  /**
   * Busca en Firestore el rol asociado al usuario con el email dado.
   * 
   * @param email - Email del usuario para buscar su rol.
   * @returns Promise que resuelve el rol del usuario o lanza un error si no se encuentra.
   */
  public async obtenerRolPorEmail(email: string): Promise<string> {
    try {
      const usuario: any[] = await this._fire.obtenerDocumentosPorCampo("usuarios", "email", email);
      if (usuario.length > 0) {
        const doc = usuario[0];
        return doc["rol"];
      } else {
        throw new Error('No se encontró ningún usuario con ese email');
      }
    } catch (error) {
      console.error('Error al obtener el rol del usuario por email:', error);
      throw error;
    }
  }

  /**
   * Busca en Firestore el rol asociado al usuario con el email dado.
   * 
   * @param email - Email del usuario para buscar su rol.
   * @returns Promise que resuelve el rol del usuario o lanza un error si no se encuentra.
   */
  public async obtenerIdUsuario(): Promise<string> {
    try {
      const emailUsuario = await this.obtenerEmailUsuario();
      const usuario: any[] = await this._fire.obtenerDocumentosPorCampo("usuarios", "email", emailUsuario);
      if (usuario.length > 0) {
        const doc = usuario[0];
        return doc["id"];
      } else {
        throw new Error('No se encontró ningún usuario con ese email');
      }
    } catch (error) {
      console.error('Error al obtener el ID del usuario por email:', error);
      throw error;
    }
  }

    /**
   * Busca en Firestore el rol asociado al usuario con el email dado.
   * 
   * @param email - Email del usuario para buscar su rol.
   * @returns Promise que resuelve el rol del usuario o lanza un error si no se encuentra.
   */
    public async obtenerUsuario(): Promise<Usuario> {
      try {
        const emailUsuario = await this.obtenerEmailUsuario();
        const usuarios: Usuario[] = await this._fire.obtenerDocumentosPorCampo("usuarios", "email", emailUsuario);
        if (usuarios.length > 0) {
          return usuarios[0];
        } else {
          throw new Error('No se encontró ningún usuario con ese email');
        }
      } catch (error) {
        console.error('Error al obtener el usuario por email:', error);
        throw error;
      }
    }

  /**
   * Cierra la sesión del usuario autenticado.
   * 
   * @returns Promise que se resuelve cuando la sesión se ha cerrado correctamente.
   */
  public cerrarSesion(): Promise<void> {
    return signOut(this.auth);
  }
}