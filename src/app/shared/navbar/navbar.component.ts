import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { distinctUntilChanged, Subscription, switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'navbar',
  standalone: true,
  imports: [ RouterLink, RouterLinkActive, CommonModule ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})

export class NavbarComponent implements OnInit, OnDestroy {
  public suscripciones: Subscription = new Subscription();
  public estaLogueado: boolean = false;
  public username: string = "";
  public rol!: string;

  constructor(private authService: AuthService) {}

  async ngOnInit() {
    this.suscripciones.add(this.authService.obtenerEmailUsuarioObservable()
      .pipe(
          distinctUntilChanged(), // Solo proceder si el valor del email cambia
          // Cancelar las llamadas anteriores si llega un nuevo valor
          switchMap(async email => {
            if (email.length > 0) {
              const rol = await this.authService.obtenerRolPorEmail(email);
              return { email, rol };
            }
            return { email: '', rol: '' }; // Sesión cerrada
          })
      )
      .subscribe(({ email, rol }) => {
        this.estaLogueado = email !== '';
        this.username = email ? email.split("@")[0] : '';
        this.rol = rol;
      })
    );
  };

  ngOnDestroy(): void {
    this.suscripciones.unsubscribe();
  }

  cerrarSesion() {
    this.authService.cerrarSesion()
    .then(() => console.log("Sesión cerrada con éxito"))
    .catch(() => console.log("Hubo un error al cerrar sesión"));
  }
}