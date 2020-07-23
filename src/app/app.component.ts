import {Component, OnInit} from '@angular/core';
import {Task} from './model/Task';
import {DataHandlerService} from './service/data-handler.service';
import {Category} from './model/Category';
import {Priority} from './model/Priority';
import {zip} from 'rxjs';
import {concatMap, map} from 'rxjs/operators';
import {IntroService} from './service/intro.service';
import {DeviceDetectorService} from 'ngx-device-detector';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // коллекция категорий с кол-вом незавершенных задач для каждой из них
  categoryMap = new Map<Category, number>();

  title = 'Todo';
  tasks: Task[];
  categories: Category[];
  priorities: Priority[];
  selectedCategory: Category = null;

  // статистика
  totalTasksCountInCategory: number;
  completedCountInCategory: number;
  uncompletedCountInCategory: number;
  uncompletedTotalTasksCount: number;

  // показать/скрыть статистику
  showStat = true;

  // поиск
  searchTaskText = ''; // текущее значение для поиска задач
  searchCategoryText = ''; // текущее значение для поиска категорий

  // фильтрация
  statusFilter: boolean;
  priorityFilter: Priority;

  // параметры бокового меню с категориями
  menuOpened: boolean; // открыть-закрыть
  menuMode: string; // тип выдвижения (поверх, с толканием и пр.)
  menuPosition: string; // сторона
  showBackdrop: boolean; // показывать фоновое затемнение или нет

  // тип устройства
  isMobile: boolean;
  isTablet: boolean;

  constructor(private dataHandler: DataHandlerService,
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
    this.dataHandler.getAllCategories().subscribe(categories => this.categories = categories);
    this.dataHandler.getAllPriorities().subscribe(priorities => this.priorities = priorities);

    // заполнить меню с категориями
    this.fillCategories();
    this.onSelectCategory(null);

    // для мобильных и планшетов - не показывать интро
    if (!this.isMobile && !this.isTablet) {
      // пробуем показать приветственные справочные материалы
      this.introService.startIntroJS(true);
    }
  }

  // заполняет категории и кол-во невыполненных задач по каждой из них (нужно для отображения категорий)
  fillCategories() {
    if (this.categoryMap) {
      this.categoryMap.clear();
    }
    this.categories = this.categories.sort((a, b) => a.title.localeCompare(b.title));

    // для каждой категории посчитать кол-во невыполненных задач
    this.categories.forEach(cat => {
      this.dataHandler.getUncompletedCountInCategory(cat).subscribe(count => this.categoryMap.set(cat, count));
    });
  }

  onSelectCategory(category: Category) {
    this.selectedCategory = category;
    this.updateTasksAndStat();

    if (this.isMobile) {
      this.menuOpened = false; // закрываем боковое меню
    }

  }

  onUpdateCategory(category: Category) {
    this.dataHandler.updateCategory(category).subscribe(() => {
      this.onSearchCategory(this.searchCategoryText);
    });
  }

  onUpdateTask(task: Task) {
    this.dataHandler.updateTask(task).subscribe(cat => {
      this.fillCategories();
      this.updateTasksAndStat();
    });
  }

  onDeleteTask(task: Task) {
    this.dataHandler.deleteTask(task.id).pipe(
      concatMap(todo => {
          return this.dataHandler.getUncompletedCountInCategory(todo.category).pipe(map(count => {
            return ({t: todo, count});
          }));
        }
      )).subscribe(result => {
        const t = result.t as Task;
        this.categoryMap.set(t.category, result.count);
        this.updateTasksAndStat();
      }
    );
  }

  onDeleteCategory(category: Category) {
    this.dataHandler.deleteCategory(category.id).subscribe(cat => {
      this.selectedCategory = null; // открываем категорию "Все"
      this.categoryMap.delete(cat); // не забыть удалить категорию из карты
      this.onSearchCategory(this.searchCategoryText);
      this.updateTasks();
    });
  }

  // поиск задач
  onSearchTasks(searchString: string) {
    this.searchTaskText = searchString;
    this.updateTasks();
  }

  // фильтрация задач по статусу (все, решенные, нерешенные)
  onFilterTasksByStatus(status: boolean) {
    this.statusFilter = status;
    this.updateTasks();
  }

  // фильрация задач по приоритету
  onFilterTasksByPriority(priority: Priority) {
    this.priorityFilter = priority;
    this.updateTasks();
  }

  updateTasks() {
    this.dataHandler.searchTasks(
      this.selectedCategory,
      this.searchTaskText,
      this.statusFilter,
      this.priorityFilter
    ).subscribe((tasks: Task[]) => this.tasks = tasks);
  }

  // добавление задачи
  onAddTask(task: Task) {
    this.dataHandler.addTask(task).pipe(// сначала добавляем задачу
      concatMap(todo => { // используем добавленный task (concatMap - для последовательного выполнения)
          // .. и считаем кол-во задач в категории с учетом добавленной задачи
          return this.dataHandler.getUncompletedCountInCategory(todo.category).pipe(map(count => {
            return ({t: todo, count}); // в итоге получаем массив с добавленной задачей и кол-вом задач для категории
          }));
        }
      )).subscribe(result => {
        const t = result.t as Task;

        // если указана категория - обновляем счетчик для соотв. категории
        if (t.category) {
          this.categoryMap.set(t.category, result.count);
        }
        this.updateTasksAndStat();
      }
    );
  }

  onAddCategory(title: string) {
    this.dataHandler.addCategory(title).subscribe(result => this.fillCategories());
  }

  // поиск категории
  onSearchCategory(title: string) {
    this.searchCategoryText = title;
    this.dataHandler.searchCategories(title).subscribe(categories => {
      this.categories = categories;
      this.fillCategories();
    });
  }

  // показывает задачи с применением всех текущий условий (категория, поиск, фильтры и пр.)
  updateTasksAndStat() {
    this.updateTasks(); // обновить список задач

    // обновить переменные для статистики
    this.updateStat();
  }

  // обновить статистику
  updateStat() {
    zip(
      this.dataHandler.getTotalCountInCategory(this.selectedCategory),
      this.dataHandler.getCompletedCountInCategory(this.selectedCategory),
      this.dataHandler.getUncompletedCountInCategory(this.selectedCategory),
      this.dataHandler.getUncompletedTotalCount())

      .subscribe(array => {
        this.totalTasksCountInCategory = array[0];
        this.completedCountInCategory = array[1];
        this.uncompletedCountInCategory = array[2];
        this.uncompletedTotalTasksCount = array[3]; // нужно для категории Все
      });
  }

  // показать-скрыть статистику
  toggleStat(showStat: boolean) {
    this.showStat = showStat;
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
