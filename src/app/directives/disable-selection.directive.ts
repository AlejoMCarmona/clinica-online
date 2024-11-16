import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appDisableSelection]',
  standalone: true
})

export class DisableSelectionDirective implements OnInit {
  @Input('appDisableSelection') disabled!: boolean;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  ngOnInit() {
    if (this.disabled) {
      this.renderer.setStyle(this.elementRef.nativeElement, 'pointer-events', `none`);
      this.renderer.setStyle(this.elementRef.nativeElement, 'opacity', `0.5`);
    }
  }
}
