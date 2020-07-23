import {Component, Inject, OnInit} from '@angular/core';
import {OperType} from '../OperType';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-priority-dialog',
  templateUrl: './edit-priority-dialog.component.html',
  styleUrls: ['./edit-priority-dialog.component.css']
})
export class EditPriorityDialogComponent implements OnInit {
  dialogTitle: string;
  priorityTitle: string;
  operType: OperType; // тип операции

  constructor(
    private dialogRef: MatDialogRef<EditPriorityDialogComponent>, // для возможности работы с текущим диалог. окном
    @Inject(MAT_DIALOG_DATA) private data: [string, string, OperType], // данные, которые передали в диалоговое окно
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.priorityTitle = this.data[0];
    this.dialogTitle = this.data[1];
    this.operType = this.data[2];
  }

  onConfirm(): void {
    this.dialogRef.close(this.priorityTitle);
  }

  // нажали отмену (ничего не сохраняем и закрываем окно)
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // нажали Удалить
  delete() {
    // @ts-ignore
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: 'Подтвердите действие',
        message: `Вы действительно хотите удалить приоритет: "${this.priorityTitle}"? (сами задачи не удаляются)`
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close('delete'); // нажали удалить
      }
    });
  }

  canDelete(): boolean {
    return this.operType === OperType.EDIT;
  }

}
