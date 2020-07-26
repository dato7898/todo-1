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
import {DeviceDetectorService} from 'ngx-device-detector';
import {TaskTo} from '../../data/dao/to/ObjectsTo';
import {DialogAction} from '../../object/DialogResult';

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

  taskTo: TaskTo;
  // все возможные параметры для поиска задач
  @Input('taskTo')
  set setTaskSearchValues(taskTo: TaskTo) {
      this.taskTo = taskTo;
      this.initSearchValues(); // записать в локальные переменные
      this.initSortDirectionIcon(); // показать правильную иконку (убывание, возрастание)
  }

  tasks: Task[];
  @Input('tasks')
  set setTasks(tasks: Task[]) {
    this.tasks = tasks;
    this.assignTableSource();   // передать данные таблице для отображения задач
  }

  @Input() selectedCategory: Category;
  @Input() categories: Category[];
  @Input() priorities: Priority[]; // список приоритетов (для фильтрации задач, для выпадающих списков)
  @Input() showSearch: boolean; // показать/скрыть инструменты поиска

  @Output() deleteTask = new EventEmitter<Task>();
  @Output() updateTask = new EventEmitter<Task>();
  @Output() addTask = new EventEmitter<Task>();
  @Output() selectCategory = new EventEmitter<Category>();
  @Output() paging = new EventEmitter<PageEvent>(); // переход по страницам данных
  @Output() searchAction = new EventEmitter<TaskTo>(); // переход по страницам данных
  @Output() toggleSearch = new EventEmitter<boolean>(); // показать/скрыть поиск

  sortIconName: string; // иконка сортировки (убывание, возрастание)

  // названия иконок из коллекции
  readonly iconNameDown = 'arrow_downward';
  readonly iconNameUp = 'arrow_upward';

  // цвета
  readonly colorCompletedTask = '#F8F9FA';
  readonly colorWhite = '#fff';

  changed = false;

  readonly defaultSortColumn = 'title';
  readonly defaultSortDirection = 'asc';

  // значения для поиска (локальные переменные)
  filterTitle: string;
  filterCompleted: number;
  filterPriorityId: number;
  filterSortColumn: string;
  filterSortDirection: string;

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
    this.dataSource.data = this.tasks; // обновить источник данных (т.к. данные массива tasks обновились)
  }

  // диалоговое окно для добавления задачи
  openAddDialog() {
    const task = new Task(null, '', 0, null, this.selectedCategory);

    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      // передаем новый пустой объект  для заполнения
      // также передаем справочные даныне (категории, приоритеты)
      data: [task, 'Добавление задачи', this.categories, this.priorities]
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }
      if (result.action === DialogAction.SAVE) { // если нажали ОК
        this.addTask.emit(task);
      }
    });
  }

  // диалоговое редактирования для добавления задачи
  openEditDialog(task: Task): void {
    const dialogRef = this.dialog.open(EditTaskDialogComponent, {
      data: [task, 'Редактирование задачи', this.categories, this.priorities],
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.DELETE) {
        this.deleteTask.emit(task);
        return;
      }

      if (result.action === DialogAction.COMPLETE) {
        task.completed = 1; // ставим статус задачи как выполненная
        this.updateTask.emit(task);
      }

      if (result.action === DialogAction.ACTIVATE) {
        task.completed = 0; // возвращаем статус задачи как невыполненная
        this.updateTask.emit(task);
        return;
      }

      if (result.action === DialogAction.SAVE) { // если нажали ОК и есть результат
        this.updateTask.emit(task);
        return;
      }
    });
  }

  // диалоговое окно подтверждения удаления
  openDeleteDialog(task: Task) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      maxWidth: '500px',
      data: {dialogTitle: 'Подтвердите действие', message: `Вы действительно хотите удалить задачу: "${task.title}"?`},
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (!(result)) { // если просто закрыли окно, ничего не нажав
        return;
      }

      if (result.action === DialogAction.OK) { // если нажали ОК
        this.deleteTask.emit(task);
      }
    });
  }

  // нажали/отжали выполнение задачи
  onToggleCompleted(task: Task) {
    if (task.completed === 0) {
      task.completed = 1;
    } else {
      task.completed = 0;
    }
    this.updateTask.emit(task);
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

  // параметры поиска
  initSearch() {
    // сохраняем значения перед поиском
    this.taskTo.text = this.filterTitle;
    this.taskTo.completed = this.filterCompleted;
    this.taskTo.priorityId = this.filterPriorityId;
    this.taskTo.sortColumn = this.filterSortColumn;
    this.taskTo.sortDirection = this.filterSortDirection;

    this.searchAction.emit(this.taskTo);
    this.changed = false; // сбрасываем флаг изменения
  }

  // проверяет, были ли изменены какие-либо параметры поиска (по сравнению со старым значением)
  checkFilterChanged() {
    this.changed = false;

    // поочередно проверяем все фильтры (текущее введенное значение с последним сохраненным)
    if (this.taskTo.text !== this.filterTitle) {
      this.changed = true;
    }

    if (this.taskTo.completed !== this.filterCompleted) {
      this.changed = true;
    }

    if (this.taskTo.priorityId !== this.filterPriorityId) {
      this.changed = true;
    }

    if (this.taskTo.sortColumn !== this.filterSortColumn) {
      this.changed = true;
    }

    if (this.taskTo.sortDirection !== this.filterSortDirection) {
      this.changed = true;
    }
    return this.changed;
  }

  // выбрать правильную иконку (убывание, возрастание)
  initSortDirectionIcon() {
    if (this.filterSortDirection === 'desc') {
      this.sortIconName = this.iconNameDown;
    } else {
      this.sortIconName = this.iconNameUp;
    }
  }

  // изменили направление сортировки
  changedSortDirection() {
    if (this.filterSortDirection === 'asc') {
      this.filterSortDirection = 'desc';
    } else {
      this.filterSortDirection = 'asc';
    }
    this.initSortDirectionIcon(); // применяем правильную иконку
  }

  // проинициализировать локальные переменные поиска
  initSearchValues() {
    if (!this.taskTo) {
      return;
    }
    this.filterTitle = this.taskTo.text;
    this.filterCompleted = this.taskTo.completed;
    this.filterPriorityId = this.taskTo.priorityId;
    this.filterSortColumn = this.taskTo.sortColumn;
    this.filterSortDirection = this.taskTo.sortDirection;
  }

  // сбросить локальные переменные поиска
  clearSearchValues() {
    this.filterTitle = '';
    this.filterCompleted = null;
    this.filterPriorityId = null;
    this.filterSortColumn = this.defaultSortColumn;
    this.filterSortDirection = this.defaultSortDirection;

    this.initSearch();
  }

  // показать/скрыть инструменты поиска
  onToggleSearch() {
    this.toggleSearch.emit(!this.showSearch);
  }
}
