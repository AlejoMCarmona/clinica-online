import { Component, OnInit } from '@angular/core';
import { LoginComponent } from '../../components/login/login.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ LoginComponent, CommonModule, RouterLink ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})

export class HomeComponent implements OnInit {
  public estaLogueado!: boolean;
  public rol!: string;

  constructor(private _authService: AuthService) {}
  
  async ngOnInit(): Promise<void> {
    const email = await this._authService.obtenerEmailUsuario();
    this.estaLogueado = email != "";
    if (email.length > 0) {
      this.rol = await this._authService.obtenerRolPorEmail(email);
    }
  }
}
