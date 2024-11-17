import { Directive, ElementRef, Input, OnInit, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appHighlightSelection]',
  standalone: true
})
export class HighlightSelectionDirective {
  @Input('appHighlightSelection') set active(value: boolean) {
    if (value) {
      this.renderer.addClass(this.el.nativeElement, 'active-selection');
    } else {
      this.renderer.removeClass(this.el.nativeElement, 'active-selection');
    }
  }

  constructor(private el: ElementRef, private renderer: Renderer2) {}
}
