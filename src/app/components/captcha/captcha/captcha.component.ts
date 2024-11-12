import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'captcha',
  standalone: true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './captcha.component.html',
  styleUrl: './captcha.component.css'
})

export class CaptchaComponent implements AfterViewInit {
  @Output() resultadoCaptcha = new EventEmitter<boolean>();
  @ViewChild('captchaCanvas', { static: true }) captchaCanvas!: ElementRef<HTMLCanvasElement>;
  
  public textoCaptcha: string = '';
  public usuarioInput: string = '';
  public canvasWidth = 150;
  public canvasHeight = 50;
  public verificacionCaptcha: boolean = false;

  constructor() {}

  public ngAfterViewInit(): void {
    this.generarCaptcha();
  }

  // Generar un nuevo captcha
  public generarCaptcha() {
    const caracteres = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    this.textoCaptcha = Array.from({ length: 6 }, () => caracteres[Math.floor(Math.random() * caracteres.length)]).join('');
    
    const canvas = this.captchaCanvas.nativeElement;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Estilos del canvas
      ctx.resetTransform();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#f2f2f2';
      ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

      // Aplicar estilos al texto
      ctx.font = '24px Arial';
      ctx.fillStyle = '#333';
      ctx.textBaseline = 'middle';

      // Agregar distorsión para hacer difícil copiar o analizar el texto
      const xPos = 10;
      const yPos = this.canvasHeight / 2;
      for (let i = 0; i < this.textoCaptcha.length; i++) {
        ctx.setTransform(1, 0.3, 0.3, 1, xPos + i * 20, yPos); // Distorsión
        ctx.fillText(this.textoCaptcha[i], 0, 0);
      }
    }
  }

  // Validar captcha
  public comprobarCaptcha() {
    const esValido = this.usuarioInput.trim() === this.textoCaptcha;
    console.log(this.usuarioInput.trim());
    console.log(this.textoCaptcha);
    this.verificacionCaptcha = esValido;
    this.resultadoCaptcha.emit(esValido);
    if (!esValido) {
      this.generarCaptcha();
    }
    this.usuarioInput = '';
  }

  // Solicitar nuevo captcha
  public nuevoCaptcha() {
    this.generarCaptcha();
    this.usuarioInput = '';
  }
}
