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
import {StatService} from './data/dao/impl/StatService';
import {DashboardData} from './object/DashboardData';
import {Stat} from './model/Stat';
import {CookieUtils} from './utils/CookieUtils';
import {SpinnerService} from './service/spinner.service';

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

  readonly defaultPageSize = 10;
  readonly defaultPageNumber = 0;

  // статистика
  uncompletedCountForCategoryAll: number;
  totalTasksFounded: number; // сколько всего задач найдено

  // параметры поисков
  categoryTo = new CategoryTo(); // экземпляр можно создать тут же, т.к. не загружаем из cookies
  taskTo: TaskTo;

  cookiesUtils = new CookieUtils();

  spinner: SpinnerService;

  readonly cookieTaskTo = 'todo:taskTo';
  readonly cookieShowStat = 'todo:showStat';
  readonly cookieShowSearch = 'todo:showSearch';

  showStat = false;
  showSearch = false;  // показать/скрыть поиск

  stat: Stat; // данные общей статистики
  dash: DashboardData = new DashboardData(); // данные для дашбоарда

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
    private statService: StatService,
    private spinnerService: SpinnerService, 
    private dialog: MatDialog, // работа с диалог. окнами
    private introService: IntroService,
    private deviceService: DeviceDetectorService // для определения типа устройства (моб., десктоп, планшет)
  ) {
    this.spinner = spinnerService;

    this.statService.getOverallStat().subscribe((result => {     // сначала получаем данные статистики
      this.stat = result;
      this.uncompletedCountForCategoryAll = this.stat.uncompletedTotal;

      // заполнить категории
      this.fillAllCategories().subscribe(res => {
        this.categories = res;
        if (!this.initSearchCookie()) {
          this.taskTo = new TaskTo();
          this.taskTo.pageSize = this.defaultPageSize;
          this.taskTo.pageNumber = this.defaultPageNumber;
        }
        this.initShowStatCookie();
        this.initShowSearchCookie();
        // первоначальное отображение задач при загрузке приложения
        // запускаем толко после выполнения статистики (т.к. понадобятся ее данные) и загруженных категорий
        this.selectCategory(this.selectedCategory);
      });
    }));
    // определяем тип запроса
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();

    this.setMenuDisplayParams(); // параметры отображения меню (зависит от устройства пользователя)
  }

  ngOnInit(): void {
    // заполнить приоритеты
    this.fillAllPriorities();
    // для мобильных и планшетов - не показывать интро
    if (!this.isMobile && !this.isTablet) {
        // this.introService.startIntroJS(true); // при первом запуске приложения - показать интро
    }
  }

  initShowStatCookie() {
    if (!this.isMobile) {
      const val = this.cookiesUtils.getCookie(this.cookieShowStat);
      if (val) {
        this.showStat = val === 'true';
      }
    }
  }

  initShowSearchCookie() {
    if (!this.isMobile) {
      const val = this.cookiesUtils.getCookie(this.cookieShowSearch);
      if (val) {
        this.showSearch = val === 'true';
      }
    }
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

  // заполнить дэш конкретными значниями
  fillDashData(completedCount: number, uncompletedCount: number) {
    this.dash.completedTotal = completedCount;
    this.dash.uncompletedTotal = uncompletedCount;
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
    if (category) { // если это не категория Все - то заполняем дэш данными выбранной категории
      this.fillDashData(category.completedCount, category.uncompletedCount);
    } else {
      this.fillDashData(this.stat.completedTotal, this.stat.uncompletedTotal); // заполняем дэш данными для категории Все
    }

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

  // обновить общую статистику и счетчик для категории Все (и показать эти данные в дашборде, если выбрана категория "Все")
  updateOverallCounter() {
    this.statService.getOverallStat().subscribe((res => { // получить из БД актуальные данные
      this.stat = res; // получили данные из БД
      this.uncompletedCountForCategoryAll = this.stat.uncompletedTotal; // для счетчика категории "Все"

      if (!this.selectedCategory) { // если выбрана категория "Все" (selectedCategory === null)
        this.fillDashData(this.stat.completedTotal, this.stat.uncompletedTotal); // заполнить дашборд данными общей статистики
      }
    }));
  }

  // обновить счетчик конкретной категории (и показать эти данные в дашборде, если выбрана эта категория)
  updateCategoryCounter(category: Category) {
    this.categoryService.findById(category.id).subscribe(cat => { // получить из БД актуальные данные
      this.categories[this.getCategoryIndex(category)] = cat; // заменить в локальном массиве
      this.showCategoryDashboard(cat);  // показать дашборд со статистикой категории
    });
  }

  // показать дэшборд с данными статистики из категроии
  showCategoryDashboard(cat: Category) {
    if (this.selectedCategory && this.selectedCategory.id === cat.id) { // если выбрана та категория, где сейчас работаем
      this.fillDashData(cat.completedCount, cat.uncompletedCount); // заполнить дашборд данными статистики из категории
    }
  }

  // добавление задачи
  addTask(task: Task) {
    this.taskService.add(task).subscribe(result => {
      if (task.category) { // если в новой задаче была указана категория
        this.updateCategoryCounter(task.category); // обновляем счетчик для указанной категории
      }
      this.updateOverallCounter(); // обновляем всю статистику (в том числе счетчик для категории "Все")
      this.searchTasks(this.taskTo); // обновляем список задач
    });
  }

  // удаление задачи
  deleteTask(task: Task) {
    this.taskService.delete(task.id).subscribe(result => {
      if (task.category) { // если в удаленной задаче была указана категория
        this.updateCategoryCounter(task.category); // обновляем счетчик для указанной категории
      }
      this.updateOverallCounter(); // обновляем всю статистику (в том числе счетчик для категории "Все")
      this.searchTasks(this.taskTo); // обновляем список задач
    });
  }

  // обновление задачи
  updateTask(task: Task) {
    this.taskService.update(task).subscribe(result => {
      if (task.oldCategory) { // если в изменной задаче старая категория была указана
        this.updateCategoryCounter(task.oldCategory); // обновляем счетчик для старой категории
      }
      if (task.category) { // если в изменной задаче новая категория была указана
        this.updateCategoryCounter(task.category); // обновляем счетчик для новой категории
      }
      this.updateOverallCounter(); // обновляем всю статистику (в том числе счетчик для категории "Все")
      this.searchTasks(this.taskTo); // обновляем список задач
    });
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

  // показать-скрыть поиск
  toggleSearch(showSearch: boolean) {
    this.showSearch = showSearch;
    this.cookiesUtils.setCookie(this.cookieShowSearch, String(showSearch));
  }

  toggleStat(showStat: boolean) {
    this.showStat = showStat;
    this.cookiesUtils.setCookie(this.cookieShowStat, String(showStat));
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

        this.cookiesUtils.setCookie(this.cookieTaskTo, JSON.stringify(taskTo));

        this.totalTasksFounded = result.totalElements; // сколько данных показывать на странице
        this.tasks = result.content; // массив задач
    });
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
    this.taskTo.pageNumber = pageEvent.pageIndex;
    this.searchTasks(this.taskTo); // показываем новые данные
  }

  // были изменены настройки приложения
  settingsChanged() {
    this.fillAllPriorities();
    this.searchTasks(this.taskTo); // обновить текущие задачи и категории для отображения
  }

  // находит индекс элемента (по id) в локальном массиве

  getCategoryFromArray(id: number): Category {
    const tmpCategory = this.categories.find(t => t.id === id);
    return tmpCategory;
  }

  getCategoryIndex(category: Category): number {
    const tmpCategory = this.categories.find(t => t.id === category.id);
    return this.categories.indexOf(tmpCategory);
  }

  getCategoryIndexById(id: number): number {
    const tmpCategory = this.categories.find(t => t.id === id);
    return this.categories.indexOf(tmpCategory);
  }

  initSearchCookie(): boolean {
    const cookie = this.cookiesUtils.getCookie(this.cookieTaskTo);
    if (!cookie) {
      return false;
    }

    const cookieJSON = JSON.parse(cookie);
    if (!cookieJSON) {
      return false;
    }

    if (!this.taskTo) {
      this.taskTo = new TaskTo();
    }

    const tmpPageSize = cookieJSON.pageSize;
    if (tmpPageSize) {
      this.taskTo.pageSize = Number(tmpPageSize);
    }

    const tmpCategoryId = cookieJSON.categoryId;
    if (tmpCategoryId) {
      this.taskTo.categoryId = Number(tmpCategoryId);
      this.selectedCategory = this.getCategoryFromArray(tmpCategoryId);
    }

    const tmpPrioriryId = cookieJSON.priorityId;
    if (tmpPrioriryId) {
      this.taskTo.priorityId = Number(tmpPrioriryId);
    }

    const tmpText = cookieJSON.text;
    if (tmpText) {
      this.taskTo.text = tmpText;
    }

    const tmpCompleted = cookieJSON.completed;
    if (tmpCompleted) {
      this.taskTo.completed = tmpCompleted;
    }

    const tmpSortColumn = cookieJSON.sortColumn;
    if (tmpSortColumn) {
      this.taskTo.sortColumn = tmpSortColumn;
    }

    const tmpSortDirection = cookieJSON.sortDirection;
    if (tmpSortDirection) {
      this.taskTo.sortDirection = tmpSortDirection;
    }

    return true;
  }

}
