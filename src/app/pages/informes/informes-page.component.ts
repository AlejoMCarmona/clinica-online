import { Component, OnInit } from '@angular/core';
import { InformeLogsComponent } from '../../components/informes/informe-logs/informe-logs.component';
import { InformeTurnosPorEspecialidadComponent } from '../../components/informes/informe-turnos-por-especialidad/informe-turnos-por-especialidad.component';
import { FirestoreService } from '../../services/firestore.service';
import { Turno } from '../../models/turno.interface';
import { CommonModule } from '@angular/common';
import { InformeTurnosPorDiaComponent } from '../../components/informes/informe-turnos-por-dia/informe-turnos-por-dia.component';
import { InformeTurnosPorMedicoEnLapsoComponent } from '../../components/informes/informe-turnos-por-medico-en-lapso/informe-turnos-por-medico-en-lapso.component';
import { FormsModule } from '@angular/forms';
import { LogTurno } from '../../models/log-turno.interface';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [ CommonModule, FormsModule, InformeLogsComponent, InformeTurnosPorEspecialidadComponent, InformeTurnosPorDiaComponent, InformeTurnosPorMedicoEnLapsoComponent ],
  templateUrl: './informes-page.component.html',
  styleUrl: './informes-page.component.css'
})

export class InformesPageComponent implements OnInit {
  public turnos!: Turno[];
  public logTurnos!: LogTurno[];
  public fechaInicio!: Date;
  public fechaFin!: Date;
  
  constructor(private firestoreService: FirestoreService) {}
  
  async ngOnInit() {
    this.turnos = await this.firestoreService.obtenerDocumentos("turnos");
    this.logTurnos = await this.firestoreService.obtenerDocumentos("log-turnos");
  }

  public async capturarGraficoComoImagen(idElemento: string, opciones: any): Promise<string> {
    const elemento = document.getElementById(idElemento);
    if (!elemento) {
        throw new Error(`Elemento con ID ${idElemento} no encontrado.`);
    }

    // Renderizar el elemento SVG o Canvas a una imagen
    const canvas = await html2canvas(elemento, opciones);
    return canvas.toDataURL('image/png');
}

public async descargarPDF() {
  const pdf = new jsPDF('p', 'mm', 'a4');
  const opcionesCaptura = { scale: 3, backgroundColor: '#ffffff' };

  const secciones = [
      { id: 'turnos-por-dia', titulo: 'Turnos por Día' },
      { id: 'turnos-por-especialidad', titulo: 'Turnos por Especialidad' },
      { id: 'turnos-por-medico-solicitados', titulo: 'Turnos Solicitados por Médico' },
      { id: 'turnos-por-medico-realizados', titulo: 'Turnos Realizados por Médico' },
      { id: 'ingresos-al-sistema', titulo: 'Ingresos al Sistema' }
  ];

  let y = 10;

  for (const seccion of secciones) {
      try {
          const imgData = await this.capturarGraficoComoImagen(seccion.id, opcionesCaptura);

          pdf.setFontSize(16);
          pdf.text(seccion.titulo, 10, y);
          y += 10;

          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth() - 20;
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(imgData, 'PNG', 10, y, pdfWidth, pdfHeight);
          y += pdfHeight + 10;

          if (y + pdfHeight > pdf.internal.pageSize.getHeight()) {
              pdf.addPage();
              y = 10;
          }
      } catch (error) {
          console.error(`No se pudo capturar la sección ${seccion.titulo}:`, error);
      }
  }

  pdf.save('informes.pdf');
}

}
