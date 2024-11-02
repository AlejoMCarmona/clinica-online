import { Injectable } from '@angular/core';
import { addDoc, collection, deleteDoc, doc, DocumentData, Firestore, getDocs, or, orderBy, OrderByDirection, query, QuerySnapshot, updateDoc, where } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})

/**
 * Servicio que interactúa con Firestore para realizar operaciones CRUD
 * como obtener, modificar, subir y eliminar documentos de colecciones específicas.
 */
export class FirestoreService {

  constructor(private _firestore: Firestore) { }

  /**
   * Obtiene todos los documentos de una colección junto con su ID, con la posibilidad de ordenar
   * por un campo específico.
   * 
   * @param nombreColeccion - El nombre de la colección en Firestore de la cual se obtendrán los documentos.
   * @param campoOrdenamiento - (Opcional) Campo por el cual se realizará el ordenamiento.
   * @param tipoOrdenamiento - (Opcional) Dirección del ordenamiento: 'asc' para ascendente o 'desc' para descendente (por defecto 'asc').
   * @returns Una promesa que resuelve un array de documentos obtenidos, incluyendo sus IDs.
   */
  public async obtenerDocumentos(nombreColeccion: string, campoOrdenamiento: string = "", tipoOrdenamiento: OrderByDirection = "asc") {
    const colRef = collection(this._firestore, nombreColeccion);
    let q;
    let data: any[] = [];

    if (campoOrdenamiento != "") {
      q = query(colRef, orderBy(campoOrdenamiento, tipoOrdenamiento));
    } else {
      q = query(colRef);
    }

    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(q);
    querySnapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return data;
  }

  /**
   * Obtiene los documentos de una colección junto con su ID, filtrando por un campo específico con un valor dado.
   * 
   * @param nombreColeccion - El nombre de la colección en Firestore de la cual se obtendrán los documentos.
   * @param campo - El nombre del campo por el cual se realizará la búsqueda.
   * @param valorCampo - El valor del campo por el cual se filtrarán los documentos.
   * @returns Una promesa que resuelve un array de documentos filtrados, incluyendo sus IDs.
   */
  public async obtenerDocumentosPorCampo(nombreColeccion: string, campo: string, valorCampo: string) {
    const colRef = collection(this._firestore, nombreColeccion);
    let q = query(colRef, where(campo, "==", valorCampo));
    let data: any[] = [];

    const querySnapshot: QuerySnapshot<DocumentData, DocumentData> = await getDocs(q);
    querySnapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });

    return data;
  }

  /**
   * Sube un nuevo documento a una colección en Firestore.
   * 
   * @param data - Los datos que se guardarán como un nuevo documento en la colección.
   * @param nombreColeccion - El nombre de la colección en la cual se subirá el documento.
   * @returns Una promesa que se resuelve cuando el documento ha sido subido exitosamente.
   */
  public subirDocumento(data: any, nombreColeccion: string) {
    const col = collection(this._firestore, nombreColeccion);
    return addDoc(col, data);
  }

  /**
   * Modifica un documento existente en Firestore.
   * 
   * @param nombreColeccion - El nombre de la colección donde se encuentra el documento a modificar.
   * @param documentoId - El ID del documento que se modificará.
   * @param nuevoDocumento - Los nuevos datos que reemplazarán el contenido existente del documento.
   * @returns Una promesa que se resuelve cuando el documento ha sido modificado exitosamente.
   */
  public async modificarDocumento(nombreColeccion: string, documentoId: string, nuevoDocumento: any): Promise<void> {
    const docRef = doc(this._firestore, nombreColeccion, documentoId);
    try {
      await updateDoc(docRef, nuevoDocumento);
      console.log(`Documento ${documentoId} actualizado exitosamente.`);
    } catch (error) {
      console.error("Error al actualizar el documento: ", error);
    }
  }

  /**
   * Elimina un documento de una colección en Firestore.
   * 
   * @param coleccion - El nombre de la colección donde se encuentra el documento.
   * @param documentoId - El ID del documento que se eliminará.
   * @returns Una promesa que se resuelve cuando el documento ha sido eliminado correctamente.
   */
  public async eliminarDocumento(coleccion: string, documentoId: string): Promise<void> {
    const docRef = doc(this._firestore, coleccion, documentoId);
    try {
      await deleteDoc(docRef);
      console.log(`Documento ${documentoId} eliminado correctamente.`);
    } catch (error) {
      console.error("Error al eliminar el documento: ", error);
    }
  }
}