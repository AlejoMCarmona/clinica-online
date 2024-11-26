import { Directive, ElementRef, HostListener, Input, Renderer2 } from '@angular/core';

@Directive({
  selector: '[tooltip]',
  standalone: true
})

export class TooltipDirective {
  @Input('tooltip') tooltipText: string = '';
  private tooltipElement: HTMLElement | null = null;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.mostrarTooltip();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.ocultarTooltip();
  }

  private mostrarTooltip() {
    if (this.tooltipElement) return;

    this.tooltipElement = this.renderer.createElement('div');
    this.renderer.appendChild(
      this.tooltipElement,
      this.renderer.createText(this.tooltipText)
    );

    this.renderer.setStyle(this.tooltipElement, 'position', 'absolute');
    this.renderer.setStyle(this.tooltipElement, 'background', '#333');
    this.renderer.setStyle(this.tooltipElement, 'color', '#fff');
    this.renderer.setStyle(this.tooltipElement, 'padding', '5px 10px');
    this.renderer.setStyle(this.tooltipElement, 'border-radius', '5px');
    this.renderer.setStyle(this.tooltipElement, 'font-size', '12px');
    this.renderer.setStyle(this.tooltipElement, 'white-space', 'nowrap');
    this.renderer.setStyle(this.tooltipElement, 'z-index', '1000');
    this.renderer.setStyle(this.tooltipElement, 'top', `${this.el.nativeElement.offsetTop - 30}px`);
    this.renderer.setStyle(this.tooltipElement, 'left', `${this.el.nativeElement.offsetLeft}px`);

    const parent = this.el.nativeElement.parentElement;
    this.renderer.appendChild(parent, this.tooltipElement);
  }

  private ocultarTooltip() {
    if (this.tooltipElement) {
      this.renderer.removeChild(this.el.nativeElement.parentElement, this.tooltipElement);
      this.tooltipElement = null;
    }
  }
}
