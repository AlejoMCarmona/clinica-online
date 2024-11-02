import { EventEmitter, Injectable, OnInit, Output } from "@angular/core";

@Injectable()
export abstract class TablaInteractivaBase<T> implements OnInit {
    public listaElementos: T[] = [];
    @Output() filaSeleccionada: EventEmitter<T> = new EventEmitter<T>();
  
    ngOnInit(): void {
      this.obtenerInformacion();
    }
  
    // Método abstracto que las clases hijas deben implementar para obtener los datos.
    abstract obtenerInformacion(): void;
  
    // Selecciona una fila y emite el evento.
    public seleccionarFila(fila: T): void {
      this.filaSeleccionada.emit(fila);
    }
}