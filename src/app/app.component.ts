import {Component, OnInit} from '@angular/core';
import {Category} from './model/Category';
import {IntroService} from './service/intro.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CategoryService} from './data/dao/impl/CategoryService';
import {CategoryTo, TaskTo} from './data/dao/to/ObjectsTo';
import {Task} from './model/Task';
import {TaskService} from './data/dao/impl/TaskService';
import {PageEvent} from '@angular/material/paginator';
import {MatDialog} from '@angular/material/dialog';
import {Observable} from 'rxjs';
import {Priority} from './model/Priority';
import {PriorityService} from './data/dao/impl/PriorityService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Todo';
  categories: Category[];
  tasks: Task[]; // текущие задачи для отображения на странице
  priorities: Priority[]; // приоритеты для отображения и фильтрации
  selectedCategory: Category = null;

  // статистика
  uncompletedCountForCategoryAll: number;

  totalTasksFounded: number; // сколько всего задач найдено

  // параметры поисков
  categoryTo = new CategoryTo(); // экземпляр можно создать тут же, т.к. не загружаем из cookies
  taskTo = new TaskTo();

  showSearch = true;  // показать/скрыть поиск

  // параметры бокового меню с категориями
  menuOpened: boolean; // открыть-закрыть
  menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
  menuPosition: string; // сторона
  showBackdrop: boolean; // показывать фоновое затемнение или нет

  // тип устройства
  isMobile: boolean;
  isTablet: boolean;

  constructor(
    private categoryService: CategoryService,
    private taskService: TaskService,
    private priorityService: PriorityService,
    private dialog: MatDialog, // работа с диалог. окнами
    private introService: IntroService,
    private deviceService: DeviceDetectorService // для определения типа устройства (моб., десктоп, планшет)
  ) {
    // определяем тип запроса
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();

    this.setMenuDisplayParams(); // параметры отображения меню (зависит от устройства пользователя)
  }

  ngOnInit(): void {
    // для мобильных и планшетов - не показывать интро
    if (!this.isMobile && !this.isTablet) {

    }
    // заполнить категории
    this.fillAllCategories().subscribe(res => {
      this.categories = res;
      // первоначальное отображение задач при загрузке приложения
      // запускаем толко после выполнения статистики (т.к. понадобятся ее данные) и загруженных категорий
      this.selectCategory(this.selectedCategory);
    });

    this.fillAllPriorities();
  }

  fillAllPriorities() {
    this.priorityService.findAll().subscribe(result => {
      this.priorities = result;
    });
  }

  // заполняет массив категорий
  fillAllCategories(): Observable<Category[]> {
    return this.categoryService.findAll();
  }

  addCategory(category: Category) {
    this.categoryService.add(category).subscribe(result => {
        // если вызов сервиса завершился успешно - добавляем новую категорию в локальный массив
        this.searchCategory(this.categoryTo); // обновляем список категорий
      }
    );
  }

  deleteCategory(category: Category) {
    this.categoryService.delete(category.id).subscribe(cat => {
      this.selectedCategory = null; // выбираем категорию "Все"
      this.searchCategory(this.categoryTo);
      this.selectCategory(this.selectedCategory);
    });
  }

  updateCategory(category: Category) {
    this.categoryService.update(category).subscribe(() => {
      this.searchCategory(this.categoryTo); // обновляем список категорий
      this.searchTasks(this.taskTo); // обновляем список задач
    });
  }

  // поиск категории
  searchCategory(categoryTo: CategoryTo) {
    this.categoryService.findCategories(categoryTo).subscribe(result => {
      this.categories = result;
    });
  }

  selectCategory(category: Category) {
    // сбрасываем, чтобы показывать результат с первой страницы
    this.taskTo.pageNumber = 0;
    this.selectedCategory = category; // запоминаем выбранную категорию
    // для поиска задач по данной категории
    this.taskTo.categoryId = category ? category.id : null;
    // обновить список задач согласно выбранной категории и другим параметрам поиска из taskSearchValues
    this.searchTasks(this.taskTo);
    if (this.isMobile) {
      this.menuOpened = false; // для мобильных - автоматически закрываем боковое меню
    }
  }

  // поиск задач
  searchTasks(taskTo: TaskTo) {
    this.taskTo = taskTo;
    this.taskService.findTasks(this.taskTo).subscribe(result => {
        // Если выбранная страница для отображения больше, чем всего страниц - заново делаем поиск и показываем 1ю страницу.
        // Если пользователь был например на 2й странице общего списка и выполнил новый поиск, в результате которого доступна только 1 страница,
        // то нужно вызвать поиск заново с показом 1й страницы (индекс 0)
        if (result.totalPages > 0 && this.taskTo.pageNumber >= result.totalPages) {
            this.taskTo.pageNumber = 0;
            this.searchTasks(this.taskTo);
        }
        this.totalTasksFounded = result.totalElements; // сколько данных показывать на странице
        this.tasks = result.content; // массив задач
    });
  }

  // добавление задачи
  addTask(task: Task) {

  }

  // удаление задачи
  deleteTask(task: Task) {

  }

  // обновление задачи
  updateTask(task: Task) {

  }

  // если закрыли меню любым способом - ставим значение false
  onClosedMenu() {
    this.menuOpened = false;
  }

  // параметры меню
  setMenuDisplayParams() {
    this.menuPosition = 'left'; // меню слева

    // настройки бокового меню для моб. и десктоп вариантов
    if (this.isMobile) {
      this.menuOpened = false; // на моб. версии по-умолчанию меню будет закрыто
      this.menuMode = 'over'; // поверх всего контента
      this.showBackdrop = true; // показывать темный фон или нет (нужно для мобильной версии)
    } else {
      this.menuOpened = true; // НЕ в моб. версии  по-умолчанию меню будет открыто (т.к. хватает места)
      this.menuMode = 'push'; // будет "толкать" основной контент, а не закрывать его
      this.showBackdrop = false; // показывать темный фон или нет
    }

  }

  // показать-скрыть меню
  toggleMenu() {
    this.menuOpened = !this.menuOpened;
  }

  // изменили кол-во элементов на странице или перешли на другую страницу
  // с помощью paginator
  paging(pageEvent: PageEvent) {
    // если изменили настройку "кол-во на странице" - заново делаем запрос и показываем с 1й страницы
    if (this.taskTo.pageSize !== pageEvent.pageSize) {
      this.taskTo.pageNumber = 0; // новые данные будем показывать с 1-й страницы (индекс 0)
    } else {
      // если просто перешли на другую страницу
      this.taskTo.pageNumber = pageEvent.pageIndex;
    }

    this.taskTo.pageSize = pageEvent.pageSize;
    this.searchTasks(this.taskTo); // показываем новые данные
  }

  // показать-скрыть поиск
  toggleSearch(showSearch: boolean) {
    this.showSearch = showSearch;
  }

}
