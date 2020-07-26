import {Component, OnInit, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Task} from 'src/app/model/Task';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {EditTaskDialogComponent} from '../../dialog/edit-task-dialog/edit-task-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {ConfirmDialogComponent} from '../../dialog/confirm-dialog/confirm-dialog.component';
import {Category} from 'src/app/model/Category';
import {Priority} from '../../model/Priority';
import {OperType} from 'src/app/dialog/OperType';
import {DeviceDetectorService} from 'ngx-device-detector';
import {TaskTo} from '../../data/dao/to/ObjectsTo';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.css']
})
export class TasksComponent implements OnInit {
  // поля для таблицы (те, что отображают данные из задачи - должны совпадать с названиями переменных класса)
  displayedColumns: string[] = ['color', 'id', 'title', 'date', 'priority', 'category', 'operations', 'select'];
  dataSource = new MatTableDataSource<Task>(); // контейнер - источник данных для таблицы

  @Input() totalTasksFounded: number; // сколько всего задач найдено
  @Input() taskTo: TaskTo;
  tasks: Task[];

  @Input('tasks')
  set setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.assignTableSource();   // передать данные таблице для отображения задач
  }

  @Output() deleteTask = new EventEmitter<Task>();
  @Output() updateTask = new EventEmitter<Task>();
  @Output() addTask = new EventEmitter<Task>();
  @Output() selectCategory = new EventEmitter<Category>();
  @Output()
  paging = new EventEmitter<PageEvent>(); // переход по страницам данных
  @Output()
  searchAction = new EventEmitter<TaskTo>(); // переход по страницам данных

  // цвета
  readonly colorCompletedTask = '#F8F9FA';
  readonly colorWhite = '#fff';

  isMobile: boolean;

  constructor(
    private dialog: MatDialog,
    private deviceService: DeviceDetectorService // для определения типа устройства
  ) {
    this.isMobile = this.deviceService.isMobile();
  }

  ngOnInit(): void {

  }

  // передать данные таблице для отображения задач
  assignTableSource() {
    // датасорс обязательно нужно создавать для таблицы, в него присваивается любой источник (БД, массивы, JSON и пр.)
    if (!this.dataSource) {
      return;
    }
    console.log(this.tasks);
    this.dataSource.data = this.tasks; // обновить источник данных (т.к. данные массива tasks обновились)
  }

  // диалоговое окно для добавления задачи
  openAddDialog() {

  }

  // диалоговое редактирования для добавления задачи
  openEditDialog(task: Task): void {

  }

  // диалоговое окно подтверждения удаления
  openDeleteDialog(task: Task) {

  }

  // нажали/отжали выполнение задачи
  onToggleCompleted(task: Task) {

  }

  // в зависимости от статуса задачи - вернуть цвет названия
  getPriorityColor(task: Task): string {
    // если задача завершена - возвращаем цвет
    if (task.completed) {
      return this.colorCompletedTask;
    }
    // вернуть цвет приоритета, если он указан
    if (task.priority && task.priority.color) {
      return task.priority.color;
    }
    return this.colorWhite;
  }

  // в зависимости от статуса задачи - вернуть фоновый цвет
  getPriorityBgColor(task: Task) {
    if (task.priority != null && !task.completed) {
      return task.priority.color;
    }
    return 'none';
  }

  // в это событие попадает как переход на другую страницу (pageIndex), так и изменение кол-ва данных на страниц (pageSize)
  pageChanged(pageEvent: PageEvent) {
    this.paging.emit(pageEvent);
  }
}
