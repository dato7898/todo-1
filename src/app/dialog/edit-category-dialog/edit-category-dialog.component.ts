import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-edit-category-dialog',
  templateUrl: './edit-category-dialog.component.html',
  styleUrls: ['./edit-category-dialog.component.css']
})
export class EditCategoryDialogComponent implements OnInit {
  dialogTitle: string;
  categoryTitle: string;

  constructor(
    private dialogRef: MatDialogRef<EditCategoryDialogComponent>, // для возможности работы с текущим диалог. окном
    @Inject(MAT_DIALOG_DATA) private data: [string, string], // данные, которые передали в диалоговое окно
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.categoryTitle = this.data[0];
    this.dialogTitle = this.data[1];
  }

  onConfirm(): void {
    this.dialogRef.close(this.categoryTitle);
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
        message: `Вы действительно хотите удалить категорию: "${this.categoryTitle}"? (сами задачи не удаляются)`
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dialogRef.close('delete'); // нажали удалить
      }
    });
  }

}
