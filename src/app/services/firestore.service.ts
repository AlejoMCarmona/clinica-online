import { Injectable } from '@angular/core';
import { Unsubscribe } from '@angular/fire/auth';
import { addDoc, collection, deleteDoc, doc, DocumentData, Firestore, getDoc, getDocs, limit, onSnapshot, orderBy, OrderByDirection, query, QuerySnapshot, updateDoc, where, WhereFilterOp, writeBatch } from '@angular/fire/firestore';

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

  public async obtenerDocumentosConFiltros(nombreColeccion: string, condiciones: { campo: string; operador: WhereFilterOp; valor: any }[], limite?: number) {
    const colRef = collection(this._firestore, nombreColeccion);
    
    let q = query(colRef);
    condiciones.forEach(condicion => {
      q = query(q, where(condicion.campo, condicion.operador, condicion.valor));
    });
    
    if (limite && limite > 0) {
      q = query(q, limit(limite));
    }
  
    const data: any[] = [];
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(q);
    
    querySnapshot.forEach(doc => {
      data.push({
        id: doc.id,
        ...doc.data()
      });
    });
  
    return data;
  }

  public async obtenerDocumentosPorID(nombreColeccion: string, id: string): Promise<any | null> {
    const docRef = doc(this._firestore, nombreColeccion, id);
    const docSnap = await getDoc(docRef);
    const dataDocumento = docSnap.data();
    if (!dataDocumento) return;
    const documento = {
      ...dataDocumento,
      id: id
    }
    return documento;
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
   * Sube múltiples documentos a una colección de Firestore de manera atómica.
   * 
   * @param data Array de documentos a subir, donde cada elemento es un objeto que representa un documento.
   * @param nombreColeccion Nombre de la colección en Firestore a la que se subirán los documentos.
   * @returns Una promesa que se resuelve cuando se completa la operación de subida de documentos. 
   *          Si el array de datos está vacío, devuelve una promesa resuelta sin realizar ninguna operación.
   */
    public async subirDocumentos(data: any[], nombreColeccion: string) {
      if (data.length == 0) return;

      const batch = writeBatch(this._firestore);
      const coleccion = collection(this._firestore, nombreColeccion);
      
      data.forEach(documento => {
        const documentoRef = doc(coleccion);
        batch.set(documentoRef, documento);
      });
      
      await batch.commit();
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
      console.log(`Documento actualizado exitosamente.`);
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
      console.log(`Documento eliminado correctamente.`);
    } catch (error) {
      console.error("Error al eliminar el documento: ", error);
    }
  }

  // Streaming
  /**
   * Escucha cambios en tiempo real de documentos en una colección de Firestore,
   * y devuelve los datos con su `id` agregado a cada documento.
   * 
   * @param coleccion - El nombre de la colección en Firestore.
   * @param campo - El nombre del campo por el cual filtrar los documentos.
   * @param valor - El valor del campo que se debe igualar para filtrar los documentos.
   * @param callback - Función opcional que recibe los documentos actualizados cada vez que hay un cambio en tiempo real.
   * 
   * @returns Unsubscribe - Función para dejar de escuchar los cambios en tiempo real.
   */
  public obtenerDocumentosEnTiempoReal<T>(coleccion: string, campo: string, valor: any, callback?: (docs: (T & { id: string })[]) => void): Unsubscribe {
    const coleccionRef = collection(this._firestore, coleccion);

    let q;
    if (campo != '' && valor != '') {
      q = query(coleccionRef, where(campo, '==', valor));
    } else {
      q = coleccionRef;
    }
    
    // Listener para escuchar los cambios en tiempo real
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const docs: (T & { id: string })[] = []; // Cada documento tendrá su información y también su ID.

      querySnapshot.forEach((doc) => {
        const docData = doc.data() as T;
        docs.push({ ...docData, id: doc.id });
      });
      
      // Si existe, llama al callback con los datos obtenidos
      if (callback) {
        callback(docs);
      } 
    });

    // Puedes devolver unsubscribe si necesitas dejar de escuchar en algún momento
    return unsubscribe;
  }
}