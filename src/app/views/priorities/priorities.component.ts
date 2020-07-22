import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Priority } from 'src/app/model/Priority';
import { MatDialog } from '@angular/material/dialog';

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

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
  }

}
