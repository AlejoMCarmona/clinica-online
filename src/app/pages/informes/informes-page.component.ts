import { Component } from '@angular/core';
import { InformeLogsComponent } from '../../components/informes/informe-logs/informe-logs.component';

@Component({
  selector: 'app-informes',
  standalone: true,
  imports: [ InformeLogsComponent ],
  templateUrl: './informes-page.component.html',
  styleUrl: './informes-page.component.css'
})

export class InformesPageComponent {

}
