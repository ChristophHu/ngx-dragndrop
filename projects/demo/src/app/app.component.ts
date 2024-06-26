import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DragAndDropModule, DroppableDirective, ValidateDrop } from '../../../ngx-dragndrop/src/public-api';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    DragAndDropModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.sass'
})
export class AppComponent {
  // dropable
  droppedData: string = ''
  droppedData2: string = ''

  @ViewChild(DroppableDirective, { read: ElementRef, static: true })
  dropableElement!: ElementRef

  onDrop({ dropData }: any): void {
    this.droppedData = dropData
    setTimeout(() => {
      this.droppedData = ''
    }, 2000)
  }

  onDrop2({ dropData }: any): void {
    this.droppedData2 = dropData;
    setTimeout(() => {
      this.droppedData2 = ''
    }, 2000)
  }

  validateDrop: ValidateDrop = ({ target }) => this.dropableElement.nativeElement.contains(target as Node)
}
