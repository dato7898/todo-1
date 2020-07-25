import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../confirm-dialog/confirm-dialog.component';
import {Category} from '../../model/Category';
import {DialogAction} from 'src/app/object/DialogResult';
import {DialogResult} from '../../object/DialogResult';

@Component({
  selector: 'app-edit-category-dialog',
  templateUrl: './edit-category-dialog.component.html',
  styleUrls: ['./edit-category-dialog.component.css']
})
export class EditCategoryDialogComponent implements OnInit {
  dialogTitle: string;
  category: Category;
  canDelete = true;

  constructor(
    private dialogRef: MatDialogRef<EditCategoryDialogComponent>, // для возможности работы с текущим диалог. окном
    @Inject(MAT_DIALOG_DATA) private data: [Category, string], // данные, которые передали в диалоговое окно
    private dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.category = this.data[0];
    this.dialogTitle = this.data[1];

    // если было передано значение, значит это редактирование, поэтому делаем удаление возможным (иначе скрываем иконку)
    if (this.category && this.category.id && this.category.id > 0) {
      this.canDelete = true;
    }
  }

  confirm(): void {
    this.dialogRef.close(new DialogResult(DialogAction.SAVE, this.category));
  }

  // нажали отмену (ничего не сохраняем и закрываем окно)
  onCancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

  // нажали Удалить
  delete() {
    // @ts-ignore
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {
        dialogTitle: 'Подтвердите действие',
        message: `Вы действительно хотите удалить категорию: "${this.category.title}"? (сами задачи не удаляются)`
      },
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.OK) {
        this.dialogRef.close(new DialogResult(DialogAction.DELETE)); // нажали удалить
      }
    });
  }

}
