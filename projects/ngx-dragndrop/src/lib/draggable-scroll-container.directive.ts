import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[mwlDraggableScrollContainer]',
  standalone: true
})
export class DraggableScrollContainerDirective {
  /**
   * @hidden
   */
  constructor(public elementRef: ElementRef<HTMLElement>) {}
}
