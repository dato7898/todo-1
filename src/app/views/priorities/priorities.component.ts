import {Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import {Priority} from 'src/app/model/Priority';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {OperType} from '../../dialog/OperType';
import {EditPriorityDialogComponent} from '../../dialog/edit-priority-dialog/edit-priority-dialog.component';

@Component({
  selector: 'app-priorities',
  templateUrl: './priorities.component.html',
  styleUrls: ['./priorities.component.css']
})
export class PrioritiesComponent implements OnInit {
  static defaultColor = '#fff';

  @Input()
  priorities: [Priority];

  // удалили
  @Output()
  deletePriority = new EventEmitter<Priority>();

  // изменили
  @Output()
  updatePriority = new EventEmitter<Priority>();

  // добавили
  @Output()
  addPriority = new EventEmitter<Priority>();

  constructor(private dialog: MatDialog) {
  }

  ngOnInit(): void {
  }

  onDeletePriority(priority: Priority) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: 'Подтвердите действие',
        message: `Вы действительно хотите удалить приоритет: "${priority.title}"? задачам проставится значение 'Без приоритета')`
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) { // если нажали ОК
        this.deletePriority.emit(priority);
      }
    });
  }

  onUpdatePriority(priority: Priority) {
    // открытие диалогового окна
    const dialogRef = this.dialog.open(EditPriorityDialogComponent, {
      data: [priority.title, 'Редактирование приоритета', OperType.EDIT]
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === 'delete') {
        this.deletePriority.emit(priority);
        return;
      }

      if (result) { // если нажали ОК и есть результат
        priority.title = result as string;
        this.updatePriority.emit(priority);
        return;
      }
    });
  }

  onAddPriority() {
    const dialogRef = this.dialog.open(EditPriorityDialogComponent, {
      data: ['', 'Добавление приоритета', OperType.ADD],
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newPriority = new Priority(null, result as string, PrioritiesComponent.defaultColor);
        this.addPriority.emit(newPriority);
      }
    });
  }

}
