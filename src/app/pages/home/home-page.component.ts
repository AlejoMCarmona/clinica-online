import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../../components/login/login.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { StorageService } from '../../services/storage.service';
import { BackgroundImageDirective } from '../../directives/background-image.directive';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ CommonModule, BackgroundImageDirective, RouterLink ],
  templateUrl: './home-page.component.html',
  styleUrl: './home-page.component.css'
})

export class HomePageComponent implements OnInit {
  public estaLogueado!: boolean;
  public rol!: string;
  public estaCargando: boolean = true;
  public urlImagenHome!: string;

  constructor(private _authService: AuthService, private _storageService: StorageService) {}
  
  async ngOnInit(): Promise<void> {
    const email = await this._authService.obtenerEmailUsuario();
    if (email.length > 0) {
      this.rol = await this._authService.obtenerRolPorEmail(email);
      this.estaLogueado = email != "";
    }
    this.urlImagenHome = await this._storageService.obtenerUrlImagen("fotos", "hospital_home.jpg");
    this.estaCargando = false;
  }
}
