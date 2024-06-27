import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[nxtDraggableScrollContainer]',
  standalone: true
})
export class DraggableScrollContainerDirective {
  /**
   * @hidden
   */
  constructor(public elementRef: ElementRef<HTMLElement>) {}
}
