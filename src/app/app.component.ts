import { Component } from '@angular/core';
import {  ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/navbar/navbar.component';
import { FooterComponent } from './shared/footer/footer.component';
import { slideInAnimation } from './shared/animations/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ RouterOutlet, NavbarComponent, FooterComponent ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  animations: [ slideInAnimation ]
})

export class AppComponent {
  public title = "Clinica Online";

  constructor(private contexts: ChildrenOutletContexts) {}

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.data?.['animation'];
  }
}
