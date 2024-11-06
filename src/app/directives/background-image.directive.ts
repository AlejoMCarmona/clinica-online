import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appBackgroundImageDirective]',
  standalone: true
})
export class BackgroundImageDirective implements OnInit {
  @Input('appBackgroundImageDirective') urlImagen!: string;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    this.renderer.setStyle(this.elementRef.nativeElement, 'background-image', `url(${this.urlImagen})`);
  }
}
