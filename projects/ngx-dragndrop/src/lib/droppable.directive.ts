import { Directive, OnInit, ElementRef, OnDestroy, Output, EventEmitter, NgZone, Input, Renderer2, Optional } from '@angular/core';
import { Subscription } from 'rxjs';
import { distinctUntilChanged, pairwise, filter, map } from 'rxjs/operators';
import { DraggableHelper } from './helpers/draggable-helper.provider';
import { DraggableScrollContainerDirective } from './draggable-scroll-container.directive';
import { addClass, removeClass } from './helpers/util';

function isCoordinateWithinRectangle(clientX: number, clientY: number, rect: ClientRect): boolean {
  return (
    clientX >= rect.left &&
    clientX <= rect.right &&
    clientY >= rect.top &&
    clientY <= rect.bottom
  )
}

export interface DropEvent<T = any> {
  dropData: T
  clientX: number
  clientY: number
  target: EventTarget
}

export interface DragEvent<T = any> extends DropEvent<T> {}

export interface ValidateDropParams extends DropEvent {}

export type ValidateDrop = (params: ValidateDropParams) => boolean;

@Directive({
  selector: '[nxtDroppable]',
  standalone: true
})
export class DroppableDirective implements OnInit, OnDestroy {
  @Input() dragOverClass: string = ''
  @Input() dragActiveClass: string = ''
  @Input() validateDrop: ValidateDrop | undefined
  @Output() dragEnter = new EventEmitter<DropEvent>()
  @Output() dragLeave = new EventEmitter<DropEvent>()
  @Output() dragOver = new EventEmitter<DropEvent>()
  @Output() drop = new EventEmitter<DropEvent>()

  currentDragSubscription: Subscription = new Subscription()

  constructor(private element: ElementRef<HTMLElement>, private draggableHelper: DraggableHelper, private zone: NgZone, private renderer: Renderer2, @Optional() private scrollContainer: DraggableScrollContainerDirective) {}

  ngOnInit() {
    this.currentDragSubscription = this.draggableHelper.currentDrag.subscribe(
      (drag$) => {
        addClass(this.renderer, this.element, this.dragActiveClass)
        const droppableElement: {
          rect?: ClientRect
          updateCache: boolean
          scrollContainerRect?: ClientRect
        } = { updateCache: true }

        const deregisterScrollListener = this.renderer.listen(this.scrollContainer ? this.scrollContainer.elementRef.nativeElement : 'window', 'scroll', () => { droppableElement.updateCache = true })

        let currentDragEvent: DragEvent
        const overlaps$ = drag$.pipe(
          map(({ clientX, clientY, dropData, target }) => {
            currentDragEvent = { clientX, clientY, dropData, target }
            if (droppableElement.updateCache) {
              droppableElement.rect =
                this.element.nativeElement.getBoundingClientRect()
              if (this.scrollContainer) {
                droppableElement.scrollContainerRect =
                  this.scrollContainer.elementRef.nativeElement.getBoundingClientRect()
              }
              droppableElement.updateCache = false
            }
            const isWithinElement = isCoordinateWithinRectangle(clientX, clientY, droppableElement.rect as ClientRect)

            const isDropAllowed =
              !this.validateDrop ||
              this.validateDrop({ clientX, clientY, target, dropData })

            if (droppableElement.scrollContainerRect) {
              return (
                isWithinElement &&
                isDropAllowed &&
                isCoordinateWithinRectangle(clientX, clientY, droppableElement.scrollContainerRect as ClientRect)
              )
            } else {
              return isWithinElement && isDropAllowed
            }
          })
        );

        const overlapsChanged$ = overlaps$.pipe(distinctUntilChanged())

        let dragOverActive: boolean; // TODO - see if there's a way of doing this via rxjs

        overlapsChanged$
          .pipe(filter((overlapsNow) => overlapsNow))
          .subscribe(() => {
            dragOverActive = true
            addClass(this.renderer, this.element, this.dragOverClass)
            if (this.dragEnter.observers.length > 0) {
              this.zone.run(() => {
                this.dragEnter.next(currentDragEvent)
              })
            }
          })

        overlaps$.pipe(filter((overlapsNow) => overlapsNow)).subscribe(() => {
          if (this.dragOver.observers.length > 0) {
            this.zone.run(() => {
              this.dragOver.next(currentDragEvent)
            })
          }
        })

        overlapsChanged$
          .pipe(
            pairwise(),
            filter(([didOverlap, overlapsNow]) => didOverlap && !overlapsNow)
          )
          .subscribe(() => {
            dragOverActive = false
            removeClass(this.renderer, this.element, this.dragOverClass)
            if (this.dragLeave.observers.length > 0) {
              this.zone.run(() => {
                this.dragLeave.next(currentDragEvent)
              })
            }
          })

        drag$.subscribe({
          complete: () => {
            deregisterScrollListener()
            removeClass(this.renderer, this.element, this.dragActiveClass)
            if (dragOverActive) {
              removeClass(this.renderer, this.element, this.dragOverClass)
              if (this.drop.observers.length > 0) {
                this.zone.run(() => {
                  this.drop.next(currentDragEvent)
                })
              }
            }
          }
        })
      }
    );
  }

  ngOnDestroy() {
    if (this.currentDragSubscription) {
      this.currentDragSubscription.unsubscribe()
    }
  }
}
