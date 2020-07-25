import {Component, OnInit} from '@angular/core';
import {Priority} from 'src/app/model/Priority';
import {MatDialogRef} from '@angular/material/dialog';

@Component({
  selector: 'app-settings-dialog',
  templateUrl: './settings-dialog.component.html',
  styleUrls: ['./settings-dialog.component.css']
})
export class SettingsDialogComponent implements OnInit {
  priorities: Priority[];

  constructor(
    private dialogRef: MatDialogRef<SettingsDialogComponent>, // для возможности работы с текущим диалог. окном
  ) {
  }

  ngOnInit(): void {
    // получаем все значения, чтобы отобразить настроку цветов
    // this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);
  }

  // нажали Закрыть
  onClose() {
    this.dialogRef.close(false);
  }

  onDeletePriority(priority: Priority) {
    // this.dataHandler.deletePriority(priority.id).subscribe();
  }

  onUpdatePriority(priority: Priority) {
    // this.dataHandler.updatePriority(priority).subscribe();
  }

  onAddPriority(priority: Priority) {
    // this.dataHandler.addPriority(priority).subscribe();
  }

}
