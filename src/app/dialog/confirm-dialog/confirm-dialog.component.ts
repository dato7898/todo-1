import {Component, OnInit, Inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';
import {DialogAction} from 'src/app/object/DialogResult';
import {DialogResult} from '../../object/DialogResult';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.css']
})
export class ConfirmDialogComponent implements OnInit {
  dialogTitle: string;
  message: string;

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>, // для работы с текущим диалог. окном
    @Inject(MAT_DIALOG_DATA) private data: { dialogTitle: string, message: string } // данные, которые передали в диалоговое окно
  ) {
    this.dialogTitle = data.dialogTitle;
    this.message = data.message;
  }

  ngOnInit(): void {
  }

  onConfirm(): void {
    this.dialogRef.close(new DialogResult(DialogAction.OK));
  }

  onCancel(): void {
    this.dialogRef.close(new DialogResult(DialogAction.CANCEL));
  }

}
