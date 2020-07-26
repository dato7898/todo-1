import {Component, OnInit} from '@angular/core';
import {Category} from './model/Category';
import {IntroService} from './service/intro.service';
import {DeviceDetectorService} from 'ngx-device-detector';
import {CategoryService} from './data/dao/impl/CategoryService';
import {CategoryTo, TaskTo} from './data/dao/to/ObjectsTo';
import {Task} from './model/Task';
import {TaskService} from './data/dao/impl/TaskService';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'Todo';
  categories: Category[];
  tasks: Task[]; // текущие задачи для отображения на странице
  selectedCategory: Category = null;

  // статистика
  uncompletedCountForCategoryAll: number;

  totalTasksFounded: number; // сколько всего задач найдено

  // параметры поисков
  categoryTo = new CategoryTo(); // экземпляр можно создать тут же, т.к. не загружаем из cookies
  taskTo = new TaskTo();

  // показать/скрыть статистику
  showStat = true;

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
    private introService: IntroService,
    private deviceService: DeviceDetectorService // для определения типа устройства (моб., десктоп, планшет)
  ) {
    // определяем тип запроса
    this.isMobile = deviceService.isMobile();
    this.isTablet = deviceService.isTablet();

    this.showStat = !this.isMobile; // если моб. устройство, то по-умолчанию не показывать статистику

    this.setMenuValues(); // установить настройки меню
  }

  ngOnInit(): void {
    // this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
    // this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);

    // заполнить меню с категориями
    this.fillAllCategories();
    this.selectCategory(null);

    // для мобильных и планшетов - не показывать интро
    if (!this.isMobile && !this.isTablet) {
      // пробуем показать приветственные справочные материалы
      this.introService.startIntroJS(true);
    }
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
      this.searchCategory(this.categoryTo); // обновляем список категорий
    });
  }

  updateCategory(category: Category) {
    this.categoryService.update(category).subscribe(() => {
      this.searchCategory(this.categoryTo); // обновляем список категорий
    });
  }

  // заполняет категории и кол-во невыполненных задач по каждой из них (нужно для отображения категорий)
  fillAllCategories() {
    this.categoryService.findAll().subscribe(result => {
      this.categories = result;
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
      this.tasks = result.content; // сколько данных показывать на странице
      console.log(result);
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
  setMenuValues() {
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
}
