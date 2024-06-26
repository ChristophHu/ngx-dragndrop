import { Subject } from 'rxjs'
import { Injectable } from '@angular/core'
import { CurrentDragData } from '../models/current-drag-data.model'

@Injectable({
  providedIn: 'root',
})
export class DraggableHelper {
  currentDrag = new Subject<Subject<CurrentDragData>>()
}
