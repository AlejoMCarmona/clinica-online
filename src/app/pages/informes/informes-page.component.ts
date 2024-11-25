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
import domtoimage from 'dom-to-image';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    InformeLogsComponent,
    InformeTurnosPorEspecialidadComponent,
    InformeTurnosPorDiaComponent,
    InformeTurnosPorMedicoEnLapsoComponent,
  ],
  templateUrl: './informes-page.component.html',
  styleUrl: './informes-page.component.css',
})
export class InformesPageComponent implements OnInit {
  public turnos!: Turno[];
  public logTurnos!: LogTurno[];
  public fechaInicio!: Date;
  public fechaFin!: Date;

  constructor(private firestoreService: FirestoreService) {}

  async ngOnInit() {
    this.turnos = await this.firestoreService.obtenerDocumentos('turnos');
    this.logTurnos = await this.firestoreService.obtenerDocumentos('log-turnos');
  }

  async capturarGraficoComoImagen(idElemento: string): Promise<string> {
    const elemento = document.getElementById(idElemento);
    if (!elemento) {
        throw new Error(`Elemento con ID ${idElemento} no encontrado.`);
    }

    try {
        return await domtoimage.toPng(elemento);
    } catch (error) {
        console.error(`Error al capturar el gráfico ${idElemento}:`, error);
        throw error;
    }
}

  public async descargarPDF() {
    const pdf = new jsPDF('p', 'mm', 'a4');

    // Logo e información básica
    const fechaEmision = new Date().toLocaleDateString();
    const img = new Image();
    img.src = "/logo_clinica.png"
    pdf.addImage(img, 'PNG', 10, 10, 30, 30);
    pdf.setFontSize(16);
    pdf.text('Informes estadísticos de la Clínica Online', 50, 20);
    pdf.setFontSize(10);
    pdf.text(`Fecha de emisión: ${fechaEmision}`, 50, 30);

    const secciones = [
      { id: 'turnos-por-dia', titulo: 'Turnos por Día' },
      { id: 'turnos-por-especialidad', titulo: 'Turnos por Especialidad' },
      { id: 'turnos-solicitados-por-medico-en-lapso', titulo: 'Turnos Solicitados por Médico' },
      { id: 'turnos-realizados-por-medico-en-lapso',titulo: 'Turnos Realizados por Médico'},
      { id: 'ingresos-al-sistema', titulo: 'Ingresos al Sistema' },
    ];

    let y = 60;

    for (const seccion of secciones) {
      try {
        const imgData = await this.capturarGraficoComoImagen(seccion.id);

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
        console.error(
          `No se pudo capturar la sección ${seccion.titulo}:`,
          error
        );
      }
    }

    pdf.save('informes.pdf');
  }
}
